import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// The id of this device's active session (see public.claim_session).
// Every request carries it; row level security only serves paid content
// while it matches the account's current session.
let sessionId: string | null = null;
const SID_KEY = 'dpa.session-id';

export async function loadSessionId() {
  sessionId = await AsyncStorage.getItem(SID_KEY);
  return sessionId;
}
export async function setSessionId(id: string | null) {
  sessionId = id;
  if (id) await AsyncStorage.setItem(SID_KEY, id);
  else await AsyncStorage.removeItem(SID_KEY);
}
export const getSessionId = () => sessionId;

const fetchWithSession: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  if (sessionId) headers.set('x-session-id', sessionId);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetchWithSession },
});

export const FUNCTIONS_URL = `${url}/functions/v1`;
export const PUBLISHABLE_KEY = key;
