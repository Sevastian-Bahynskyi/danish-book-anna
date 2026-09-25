import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import grammar from '@/content/grammar.json';
import { useProfile } from './auth';

export type GrammarTopic = (typeof grammar.topics)[number];
export type GrammarQuestion = (typeof grammar.quiz)[number];
export type GrammarExample = { id: string; topicId: string; da: string; ua: string };

export const grammarContent = grammar;

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

const queryKey = (userId: string | undefined) => ['grammar-saved', userId];
const storageKey = (userId: string) => `grammar-saved:${userId}`;

export function useGrammarSaved() {
  const profile = useProfile();
  return useQuery({
    queryKey: queryKey(profile?.id),
    enabled: !!profile,
    queryFn: async (): Promise<string[]> => {
      if (!profile) return [];
      const raw = await AsyncStorage.getItem(storageKey(profile.id));
      if (!raw) return [];
      try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
      } catch {
        return [];
      }
    },
  });
}

export function useToggleGrammarSaved() {
  const profile = useProfile();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string[]> => {
      if (!profile) throw new Error('Sign in required');
      const key = queryKey(profile.id);
      const current = client.getQueryData<string[]>(key) ?? [];
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      await AsyncStorage.setItem(storageKey(profile.id), JSON.stringify(next));
      return next;
    },
    onSuccess: (next) => client.setQueryData(queryKey(profile?.id), next),
  });
}
