import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';

export type AdminUser = {
  id: string;
  phone: string;
  display_name: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  online: boolean;
  last_login_at: string | null;
  created_at: string;
  chapters_done: number;
  saved: number;
  logins: number;
};
export type AllowedPhone = { phone: string; note: string | null; added_at: string; registered: boolean };
export type Stats = {
  users: number;
  blocked: number;
  waiting: number;
  active_7d: number;
  logins_30d: number;
  finished_all: number;
  saved_total: number;
  chapters: { id: number; title_da: string; visited: number; completed: number }[];
};
export type UserDetail = {
  profile: Omit<AdminUser, 'chapters_done' | 'saved' | 'logins'>;
  progress: { chapter_id: number; visited_at: string; completed_at: string | null }[];
  logins: { at: string; user_agent: string | null }[];
  saved: number;
  reset_pending: boolean;
};

async function rpc<T>(fn: string, args?: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const useAdminUsers = () => useQuery({ queryKey: ['admin', 'users'], queryFn: () => rpc<AdminUser[]>('admin_users') });
export const useAllowedPhones = () => useQuery({ queryKey: ['admin', 'phones'], queryFn: () => rpc<AllowedPhone[]>('admin_allowed_phones') });
export const useStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: () => rpc<Stats>('admin_stats') });
export const useUserDetail = (id: string) => useQuery({ queryKey: ['admin', 'user', id], queryFn: () => rpc<UserDetail>('admin_user_detail', { uid: id }) });

export function useAdminAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fn, args }: { fn: string; args: Record<string, unknown> }) => rpc<unknown>(fn, args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function timeAgo(iso: string | null) {
  if (!iso) return 'ще не заходила';
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return 'щойно';
  if (mins < 60) return `${mins} хв тому`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} год тому`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} дн. тому`;
  return d.toLocaleDateString('uk-UA');
}

export function device(ua: string | null) {
  if (!ua) return 'Невідомий пристрій';
  const os = /iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return [os, br].filter(Boolean).join(', ') || ua.slice(0, 40);
}
