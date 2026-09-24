// Mirrors private.normalize_phone and the account Edge Function.
export function normalizePhone(raw: string): string {
  const s = String(raw ?? '').replace(/[^0-9+]/g, '');
  if (s.startsWith('+')) return '+' + s.slice(1).replace(/\+/g, '');
  if (s.startsWith('00')) return '+' + s.slice(2);
  if (s.length === 8) return '+45' + s;
  return '+' + s;
}
export const isValidPhone = (p: string) => /^\+[0-9]{8,15}$/.test(p);
export const phoneEmail = (p: string) => `p${p.slice(1)}@phone.dansk-paa-arbejde.app`;

export function formatPhone(p: string) {
  if (p.startsWith('+45') && p.length === 11) return `+45 ${p.slice(3, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)} ${p.slice(9)}`;
  return p;
}
