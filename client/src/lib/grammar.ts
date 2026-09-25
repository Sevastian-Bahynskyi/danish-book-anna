import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import grammar from '@/content/grammar.json';
import { useProfile } from './auth';
import { supabase } from './supabase';

export type GrammarTopic = (typeof grammar.topics)[number];
export type GrammarQuestion = (typeof grammar.quiz)[number];
export type GrammarExample = { id: string; topicId: string; da: string; ua: string };
export type GrammarChapter = { id: number; title_da: string; description_ua: string; intro: string; topics: GrammarTopic[] };

export const grammarContent = grammar;

// Chapters 13 and 14 sit in the chapter list next to the 12 book chapters.
// Their rows in `chapters` (for synced progress) carry the same titles.
export const grammarChapters: GrammarChapter[] = grammar.chapters.map((chapter) => ({
  id: chapter.id,
  title_da: chapter.title_da,
  description_ua: chapter.title,
  intro: chapter.intro.trim() === '---' ? '' : chapter.intro,
  topics: grammar.topics.filter((topic) => topic.id.startsWith(`${chapter.id}.`)),
}));

export const LAST_CHAPTER = grammarChapters[grammarChapters.length - 1]?.id ?? 12;

export function grammarChapter(id: number): GrammarChapter | undefined {
  return grammarChapters.find((chapter) => chapter.id === id);
}

export function grammarChapterOf(topicId: string): GrammarChapter | undefined {
  return grammarChapters.find((chapter) => topicId.startsWith(`${chapter.id}.`));
}

// "Ordstilling — порядок слів" → Danish part and Ukrainian part.
export function splitTopicTitle(title: string): { da: string | null; ua: string } {
  const [head, ...rest] = title.split(' — ');
  if (rest.length === 0 || ukrainianPattern.test(head)) return { da: null, ua: title.replace(/ — /g, ': ') };
  return { da: head, ua: rest.join(': ') };
}

const examplePattern = /^\*\*([^*\n]+)\*\*\s{2}\n([^\n]+)$/;
const ukrainianPattern = /[А-Яа-яІіЇїЄєҐґ]/;

export function grammarExample(block: string, topicId: string, index: number): GrammarExample | null {
  const match = block.trim().match(examplePattern);
  if (!match || ukrainianPattern.test(match[1]) || !ukrainianPattern.test(match[2])) return null;
  return { id: `example:${topicId}:${index}`, topicId, da: match[1].trim(), ua: match[2].trim() };
}

export const grammarExamples = grammar.topics.flatMap((topic) =>
  topic.body.split(/\n\s*\n/).flatMap((block, index) => {
    const example = grammarExample(block, topic.id, index);
    return example ? [example] : [];
  }),
);

// ---------------------------------------------------------------- synced state
// Saved grammar items and read topics live in Supabase (grammar_saved,
// grammar_topics_read); chapter 13/14 progress uses the shared `progress` table.
const savedKey = ['grammar-saved'];
const readKey = ['grammar-read'];

// Before sync existed, grammar saves and progress were kept on the device.
// Move anything found there to the account once, then forget it.
let imported: Promise<void> | null = null;
function importDeviceState(userId: string): Promise<void> {
  imported ??= (async () => {
    const savedStorage = `grammar-saved:${userId}`;
    const progressStorage = `grammar-progress:${userId}`;
    const [savedRaw, progressRaw] = await Promise.all([AsyncStorage.getItem(savedStorage), AsyncStorage.getItem(progressStorage)]);
    if (!savedRaw && !progressRaw) return;
    const parse = (raw: string | null): unknown => {
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };
    const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
    const saved = list(parse(savedRaw)).filter((id): id is string => typeof id === 'string' && /^(topic|example):1[34]\.\d{1,2}(:\d{1,3})?$/.test(id));
    const progress = parse(progressRaw);
    const record = progress && typeof progress === 'object' ? (progress as Record<string, unknown>) : {};
    const topics = list(record.topics).filter((id): id is string => typeof id === 'string' && /^1[34]\.\d{1,2}$/.test(id));
    const done = list(record.done).filter((id): id is number => id === 13 || id === 14);
    const writes = [];
    if (saved.length) writes.push(supabase.from('grammar_saved').upsert(saved.map((item_id) => ({ user_id: userId, item_id })), { onConflict: 'user_id,item_id', ignoreDuplicates: true }));
    if (topics.length) writes.push(supabase.from('grammar_topics_read').upsert(topics.map((topic_id) => ({ user_id: userId, topic_id })), { onConflict: 'user_id,topic_id', ignoreDuplicates: true }));
    if (done.length) {
      const now = new Date().toISOString();
      writes.push(supabase.from('progress').upsert(done.map((chapter_id) => ({ user_id: userId, chapter_id, visited_at: now, completed_at: now })), { onConflict: 'user_id,chapter_id' }));
    }
    const results = await Promise.all(writes);
    if (results.some((result) => result.error)) throw new Error('Grammar import failed');
    await AsyncStorage.multiRemove([savedStorage, progressStorage]);
  })().catch(() => {
    imported = null; // try again next time; nothing was removed from the device
  });
  return imported;
}

export function useGrammarSaved() {
  const profile = useProfile();
  return useQuery({
    queryKey: savedKey,
    enabled: !!profile,
    queryFn: async (): Promise<string[]> => {
      if (profile) await importDeviceState(profile.id);
      const { data, error } = await supabase.from('grammar_saved').select('item_id').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: { item_id: string }) => row.item_id);
    },
  });
}

export function useToggleGrammarSaved() {
  const profile = useProfile();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!profile) throw new Error('Sign in required');
      // onMutate runs first, so the cache already shows the state the reader asked for.
      const wanted = client.getQueryData<string[]>(savedKey)?.includes(id);
      if (!wanted) {
        const { error } = await supabase.from('grammar_saved').delete().match({ item_id: id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('grammar_saved').insert({ user_id: profile.id, item_id: id });
        if (error && error.code !== '23505') throw error;
      }
    },
    // Optimistic: the heart fills immediately.
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: savedKey });
      const prev = client.getQueryData<string[]>(savedKey) ?? [];
      client.setQueryData(savedKey, prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev]);
      return { prev };
    },
    onError: (_error, _id, context) => context && client.setQueryData(savedKey, context.prev),
    onSettled: () => client.invalidateQueries({ queryKey: savedKey }),
  });
}

export function useGrammarRead() {
  const profile = useProfile();
  return useQuery({
    queryKey: readKey,
    enabled: !!profile,
    queryFn: async (): Promise<string[]> => {
      if (profile) await importDeviceState(profile.id);
      const { data, error } = await supabase.from('grammar_topics_read').select('topic_id');
      if (error) throw error;
      return (data ?? []).map((row: { topic_id: string }) => row.topic_id);
    },
  });
}

export function useMarkTopicRead() {
  const profile = useProfile();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: string): Promise<void> => {
      if (!profile) throw new Error('Sign in required');
      const { error } = await supabase
        .from('grammar_topics_read')
        .upsert({ user_id: profile.id, topic_id: topicId }, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: (_data, topicId) => client.setQueryData<string[]>(readKey, (prev) => (prev?.includes(topicId) ? prev : [...(prev ?? []), topicId])),
  });
}
