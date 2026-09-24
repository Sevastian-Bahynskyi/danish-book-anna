import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { isValidPhone, normalizePhone, phoneEmail } from './phone';
import { FUNCTIONS_URL, PUBLISHABLE_KEY, getSessionId, loadSessionId, setSessionId, supabase } from './supabase';

export type Profile = { id: string; phone: string; display_name: string | null; role: 'user' | 'admin'; status: 'active' | 'blocked' };
// Why the person is looking at the sign-in screen, if it was not their choice.
export type Notice = 'replaced' | 'blocked' | 'password-changed' | null;

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut'; notice: Notice }
  | { status: 'ready'; session: Session; profile: Profile };

type AuthApi = {
  state: AuthState;
  signIn: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string) => Promise<void>;
  resetPassword: (phone: string, code: string, password: string) => Promise<void>;
  checkPhone: (phone: string) => Promise<'first' | 'allowed' | 'exists' | 'not_allowed'>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

export class AuthError extends Error {}

const MESSAGES: Record<string, string> = {
  bad_phone: 'Перевірте номер телефону. Наприклад: 12 34 56 78 або +380 …',
  weak_password: 'Пароль має бути щонайменше 8 символів.',
  exists: 'Цей номер уже зареєстрований. Увійдіть зі своїм паролем.',
  phone_not_allowed: 'Цього номера ще немає у списку. Напишіть Анні в Messenger після покупки, і вона відкриє доступ.',
  bad_code: 'Код неправильний або вже не діє. Попросіть Анну надіслати новий.',
  invalid_login: 'Неправильний номер або пароль.',
  blocked: 'Доступ до цього акаунта закрито. Напишіть Анні, якщо це помилка.',
  network: 'Немає з\'єднання. Перевірте інтернет і спробуйте ще раз.',
  server: 'Щось пішло не так. Спробуйте ще раз трохи згодом.',
};
const fail = (code: string): never => {
  throw new AuthError(MESSAGES[code] ?? MESSAGES.server);
};

async function callAccount(body: Record<string, string>) {
  let res: Response;
  try {
    res = await fetch(`${FUNCTIONS_URL}/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${PUBLISHABLE_KEY}` },
      body: JSON.stringify(body),
    });
  } catch {
    return fail('network');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(data.error ?? 'server');
  return data;
}

function userAgent() {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') return navigator.userAgent;
  return `${Platform.OS} ${Platform.Version}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const queryClient = useQueryClient();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const endLocally = useCallback(
    async (notice: Notice) => {
      await setSessionId(null);
      await supabase.auth.signOut({ scope: 'local' });
      queryClient.clear();
      setState({ status: 'signedOut', notice });
    },
    [queryClient],
  );

  const loadProfile = useCallback(async (session: Session) => {
    const { data, error } = await supabase.from('profiles').select('id, phone, display_name, role, status').eq('id', session.user.id).single();
    if (error || !data) throw error ?? new Error('no profile');
    return data as Profile;
  }, []);

  // Ask the server whether this device is still the active session.
  const verify = useCallback(async () => {
    const s = stateRef.current;
    if (s.status !== 'ready') return;
    const { data, error } = await supabase.rpc('session_status', { sid: getSessionId() });
    if (error) return; // offline: keep the page, the server still guards content
    if (data === 'replaced') await endLocally('replaced');
    else if (data === 'blocked') await endLocally('blocked');
  }, [endLocally]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const sid = await loadSessionId();
      if (!alive) return;
      if (!data.session || !sid) {
        if (data.session) await supabase.auth.signOut({ scope: 'local' });
        setState({ status: 'signedOut', notice: null });
        return;
      }
      const { data: st } = await supabase.rpc('session_status', { sid });
      if (st === 'ok') {
        try {
          setState({ status: 'ready', session: data.session, profile: await loadProfile(data.session) });
        } catch {
          await endLocally(null);
        }
      } else {
        await endLocally(st === 'blocked' ? 'blocked' : st === 'replaced' ? 'replaced' : null);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && stateRef.current.status === 'ready') setState({ status: 'signedOut', notice: 'replaced' });
      if (event === 'TOKEN_REFRESHED' && session && stateRef.current.status === 'ready') {
        setState((s) => (s.status === 'ready' ? { ...s, session } : s));
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [endLocally, loadProfile]);

  // Check the session every minute and whenever the app comes back to the foreground.
  useEffect(() => {
    if (state.status !== 'ready') return;
    const timer = setInterval(verify, 60_000);
    const appState = AppState.addEventListener('change', (s) => s === 'active' && verify());
    const onFocus = () => verify();
    if (Platform.OS === 'web') window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      appState.remove();
      if (Platform.OS === 'web') window.removeEventListener('focus', onFocus);
    };
  }, [state.status, verify]);

  const signIn = useCallback(
    async (rawPhone: string, password: string) => {
      const phone = normalizePhone(rawPhone);
      if (!isValidPhone(phone)) fail('bad_phone');
      let signInResult;
      try {
        signInResult = await supabase.auth.signInWithPassword({ email: phoneEmail(phone), password });
      } catch {
        return fail('network');
      }
      const { data, error } = signInResult;
      if (error || !data.session) return fail(error && /fetch|network/i.test(error.message) ? 'network' : 'invalid_login');
      const { data: sid, error: claimError } = await supabase.rpc('claim_session', { user_agent: userAgent() });
      if (claimError || !sid) {
        await supabase.auth.signOut({ scope: 'local' });
        return fail(/blocked/.test(claimError?.message ?? '') ? 'blocked' : 'server');
      }
      await setSessionId(sid as string);
      queryClient.clear();
      setState({ status: 'ready', session: data.session, profile: await loadProfile(data.session) });
    },
    [loadProfile, queryClient],
  );

  const register = useCallback(
    async (rawPhone: string, password: string, name: string) => {
      const phone = normalizePhone(rawPhone);
      if (!isValidPhone(phone)) fail('bad_phone');
      if (password.length < 8) fail('weak_password');
      await callAccount({ action: 'register', phone, password, name });
      await signIn(phone, password);
    },
    [signIn],
  );

  const resetPassword = useCallback(
    async (rawPhone: string, code: string, password: string) => {
      const phone = normalizePhone(rawPhone);
      if (!isValidPhone(phone)) fail('bad_phone');
      if (password.length < 8) fail('weak_password');
      await callAccount({ action: 'reset', phone, code, password });
      await signIn(phone, password);
    },
    [signIn],
  );

  const checkPhone = useCallback(async (rawPhone: string) => {
    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) fail('bad_phone');
    const data = await callAccount({ action: 'check', phone });
    return data.status;
  }, []);

  const signOut = useCallback(async () => {
    await endLocally(null);
  }, [endLocally]);

  return (
    <AuthContext.Provider value={{ state, signIn, register, resetPassword, checkPhone, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export function useProfile() {
  const { state } = useAuth();
  return state.status === 'ready' ? state.profile : null;
}
