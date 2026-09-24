import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useProfile } from './auth';
import { supabase } from './supabase';

export type Chapter = { id: number; title_da: string; description_ua: string; intro_ua: string; phrase_count: number };
export type Phrase = { id: number; chapter_id: number; sort: number; da: string; ua: string; explanation_ua: string | null };
export type DialogueLine = { who: string; da: string; ua: string; me: boolean };
export type Dialogue = { id: number; chapter_id: number; title_ua: string; lines: DialogueLine[] };
export type Note = { id: number; chapter_id: number; body_ua: string };
export type Mistake = { id: number; chapter_id: number; wrong: string; better: string; why_ua: string };
export type Message = { id: number; chapter_id: number; audience_ua: string; da: string; ua: string };
export type Exercise = { id: number; chapter_id: number; question_ua: string; options: string[]; correct: number; explain_ua: string | null };
export type Vocab = { id: number; chapter_id: number; da: string; ua: string };
export type Library = {
  chapters: Chapter[];
  phrases: Phrase[];
  dialogues: Dialogue[];
  notes: Note[];
  mistakes: Mistake[];
  messages: Message[];
  exercises: Exercise[];
  vocab: Vocab[];
};
export type SavedKind = 'phrase' | 'message';
export type Progress = { chapter_id: number; visited_at: string; completed_at: string | null };

async function rows<T>(table: string, order: string[]) {
  let q = supabase.from(table).select('*');
  for (const o of order) q = q.order(o);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

// The whole book is small (a few hundred rows), so it is loaded once after
// sign-in and kept in memory: chapters open instantly and search works offline.
export function useLibrary() {
  const profile = useProfile();
  return useQuery({
    queryKey: ['library'],
    enabled: !!profile,
    staleTime: Infinity,
    queryFn: async (): Promise<Library> => {
      const [chapters, phrases, dialogues, notes, mistakes, messages, exercises, vocab] = await Promise.all([
        rows<Omit<Chapter, 'phrase_count'>>('chapters', ['id']),
        rows<Phrase>('phrases', ['chapter_id', 'sort']),
        rows<Dialogue>('dialogues', ['chapter_id', 'sort']),
        rows<Note>('notes', ['chapter_id', 'sort']),
        rows<Mistake>('mistakes', ['chapter_id', 'sort']),
        rows<Message>('messages', ['chapter_id', 'sort']),
        rows<Exercise>('exercises', ['chapter_id', 'sort']),
        rows<Vocab>('vocab', ['chapter_id', 'sort']),
      ]);
      return {
        chapters: chapters.map((c) => ({ ...c, phrase_count: phrases.filter((p) => p.chapter_id === c.id).length })),
        phrases,
        dialogues,
        notes,
        mistakes,
        messages,
        exercises,
        vocab,
      };
    },
  });
}

export function useChapter(id: number) {
  const lib = useLibrary();
  const data = lib.data;
  const pick = <T extends { chapter_id: number }>(list: T[] | undefined) => (list ?? []).filter((x) => x.chapter_id === id);
  return {
    ...lib,
    chapter: data?.chapters.find((c) => c.id === id),
    phrases: pick(data?.phrases),
    dialogues: pick(data?.dialogues),
    notes: pick(data?.notes),
    mistakes: pick(data?.mistakes),
    messages: pick(data?.messages),
    exercises: pick(data?.exercises),
    vocab: pick(data?.vocab),
  };
}

// ---------------------------------------------------------------- saved
const savedKey = ['saved'];
export function useSaved() {
  const profile = useProfile();
  return useQuery({
    queryKey: savedKey,
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase.from('saved_items').select('kind, item_id, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return data as { kind: SavedKind; item_id: number; created_at: string }[];
    },
  });
}

export function useToggleSaved() {
  const qc = useQueryClient();
  const profile = useProfile();
  return useMutation({
    mutationFn: async ({ kind, id, saved }: { kind: SavedKind; id: number; saved: boolean }) => {
      if (saved) {
        const { error } = await supabase.from('saved_items').delete().match({ kind, item_id: id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('saved_items').insert({ user_id: profile!.id, kind, item_id: id });
        if (error && error.code !== '23505') throw error;
      }
    },
    // Optimistic: the heart fills immediately.
    onMutate: async ({ kind, id, saved }) => {
      await qc.cancelQueries({ queryKey: savedKey });
      const prev = qc.getQueryData<{ kind: SavedKind; item_id: number; created_at: string }[]>(savedKey) ?? [];
      qc.setQueryData(
        savedKey,
        saved ? prev.filter((s) => !(s.kind === kind && s.item_id === id)) : [{ kind, item_id: id, created_at: new Date().toISOString() }, ...prev],
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(savedKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: savedKey }),
  });
}

export function useIsSaved() {
  const { data } = useSaved();
  return (kind: SavedKind, id: number) => !!data?.some((s) => s.kind === kind && s.item_id === id);
}

// ---------------------------------------------------------------- progress
const progressKey = ['progress'];
export function useProgress() {
  const profile = useProfile();
  return useQuery({
    queryKey: progressKey,
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase.from('progress').select('chapter_id, visited_at, completed_at');
      if (error) throw error;
      return data as Progress[];
    },
  });
}

export function useMarkProgress() {
  const qc = useQueryClient();
  const profile = useProfile();
  return useMutation({
    mutationFn: async ({ chapterId, completed }: { chapterId: number; completed?: boolean }) => {
      const row: Record<string, unknown> = { user_id: profile!.id, chapter_id: chapterId, visited_at: new Date().toISOString() };
      if (completed !== undefined) row.completed_at = completed ? new Date().toISOString() : null;
      const { error } = await supabase.from('progress').upsert(row, { onConflict: 'user_id,chapter_id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: progressKey }),
  });
}

export function useCompletedCount() {
  const { data } = useProgress();
  return data?.filter((p) => p.completed_at).length ?? 0;
}
