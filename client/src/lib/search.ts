// Keyword search over the book. No AI: a prepared synonym list plus simple
// stemming (word prefixes), which is enough for short workplace phrases.
import type { Library } from './content';

export type Hit =
  | { kind: 'phrase'; id: number; chapter_id: number; da: string; ua: string; score: number }
  | { kind: 'message'; id: number; chapter_id: number; da: string; ua: string; score: number; audience: string }
  | { kind: 'vocab'; id: number; chapter_id: number; da: string; ua: string; score: number };

// Each group: words people type (prefixes) -> words that appear in the book.
const SYNONYMS: [string[], string[]][] = [
  [['захвор', 'хвор', 'застуд', 'температ', 'лікар', 'болить', 'погано', 'syg', 'sick'], ['syg', 'feber', 'læge', 'ondt', 'hovedpine', 'хвор', 'лікар', 'болить', 'погано']],
  [['запізн', 'спізн', 'затрим', 'пізно', 'forsinket', 'late'], ['forsinket', 'senere', 'på vej', 'запізн', 'дорозі', 'пізніше']],
  [['шеф', 'бос', 'начальн', 'керівн', 'менедж', 'chef', 'leder', 'boss'], ['chef', 'leder', 'начальник', 'керівник']],
  [['перерв', 'обід', 'кав', 'pause', 'frokost', 'kaffe'], ['pause', 'frokost', 'kaffe', 'перерв', 'обід', 'каву']],
  [['не зрозум', 'не розум', 'зрозум', 'розумі', 'перепит', 'повтор', 'поясн', 'повільн', 'forstå', 'gentage', 'forklare'], ['forstå', 'forstået', 'forklare', 'gentage', 'langsommere', 'розумі', 'зрозумі', 'поясн', 'повтор', 'повільн']],
  [['відпуст', 'вихідн', 'відгул', 'ferie', 'fri', 'вакац'], ['ferie', 'fri', 'weekend', 'відпуст', 'вихідн']],
  [['зарплат', 'гроші', 'оплат', 'løn', 'податок', 'розрахунк'], ['løn', 'lønseddel', 'зарплат', 'розрахунков']],
  [['змін', 'графік', 'розклад', 'годин', 'vagt', 'timer'], ['vagt', 'vagtplan', 'timer', 'змін', 'графік', 'годин']],
  [['помилк', 'проблем', 'конфлікт', 'сварк', 'fejl', 'problem'], ['fejl', 'problem', 'помилк', 'проблем', 'misforstået']],
  [['телефон', 'дзвін', 'подзвон', 'зателеф', 'передзвон', 'смс', 'sms', 'ringe'], ['ringe', 'ringer', 'sms', 'telefon', 'телефон', 'передзвон', 'sms']],
  [['лист', 'пошт', 'імейл', 'email', 'e-mail', 'mail', 'повідомл', 'напис'], ['mail', 'besked', 'skriver', 'лист', 'повідомлення']],
  [['допомог', 'hjælp', 'help'], ['hjælp', 'hjælpe', 'допомог']],
  [['перший день', 'новеньк', 'нова робот', 'новий', 'нова', 'ny'], ['ny', 'første', 'новеньк', 'перший']],
  [['контракт', 'договір', 'умов', 'kontrakt'], ['kontrakt', 'ansat', 'контракт']],
  [['колег', 'kollega'], ['kollega', 'колег']],
  [['зустріч', 'нарад', 'мітинг', 'møde'], ['møde', 'mødet', 'зустріч']],
  [['дяку', 'подяк', 'tak'], ['tak', 'дякую']],
  [['вибач', 'перепрош', 'undskyld', 'sorry'], ['undskyld', 'beklager', 'перепрош']],
  [['раніше', 'піти додому', 'tidligere'], ['tidligere', 'gå hjem', 'раніше', 'додому']],
  [['кого запит', 'кому', 'хто може', 'hvem'], ['hvem', 'кого', 'кому', 'хто']],
  [['завдання', 'що робити', 'як зробити', 'opgave'], ['opgave', 'gøre', 'lave', 'завдання', 'зробити']],
];

// Short filler words that would match almost every phrase.
const STOP = new Set(['мені', 'мене', 'мій', 'моя', 'моє', 'мої', 'що', 'як', 'це', 'для', 'про', 'цей', 'щоб', 'треба', 'потрібно', 'хочу', 'можна', 'jeg', 'det', 'der', 'har', 'kan', 'til', 'med', 'hvad', 'hvor']);

export const POPULAR = ['я захворіла', 'шеф', 'перерва', 'не зрозуміла', 'відпустка'];

export const SITUATIONS: { label: string; query: string }[] = [
  { label: 'я не зрозуміла, що сказали', query: 'не зрозуміла' },
  { label: 'я запізнююся', query: 'запізнююся' },
  { label: 'я захворіла', query: 'захворіла' },
  { label: 'мені потрібно піти раніше', query: 'піти раніше' },
  { label: 'я не знаю, як це зробити', query: 'як зробити' },
  { label: 'я зробила помилку', query: 'помилка' },
  { label: 'мені потрібно попросити допомогу', query: 'допомога' },
  { label: 'я хочу поговорити з начальником', query: 'начальник' },
  { label: 'я хочу поміняти зміну', query: 'поміняти зміну' },
  { label: 'мені потрібно запитати про зарплату', query: 'зарплата' },
  { label: 'я не знаю, кому поставити запитання', query: 'кого запитати' },
];

export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/[’'ʼ`]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[.,!?;:«»"()…–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const foldQuery = (s: string) => fold(s).replace(/oe/g, 'o').replace(/aa/g, 'a');

// Word prefix used for matching inflected Ukrainian and Danish forms.
function stem(w: string) {
  if (w.length <= 4) return w;
  return w.slice(0, Math.max(4, w.length - 2));
}

function containsWordStart(hay: string, needle: string) {
  if (!needle) return false;
  if (needle.includes(' ')) return hay.includes(needle);
  return (' ' + hay).includes(' ' + needle);
}

export function expand(query: string) {
  const q = foldQuery(query);
  const extra = new Set<string>();
  for (const [triggers, terms] of SYNONYMS) {
    if (triggers.some((t) => q.includes(fold(t)) || fold(t).startsWith(q))) terms.forEach((t) => extra.add(fold(t)));
  }
  return { q, tokens: q.split(' ').filter((w) => w.length > 2 && !STOP.has(w)), extra: [...extra] };
}

export function search(lib: Library, query: string, limit = 30): Hit[] {
  const { q, tokens, extra } = expand(query);
  if (!q) return [];
  const score = (text: string) => {
    const hay = fold(text);
    let s = 0;
    if (hay.includes(q)) s += 10;
    const matched = tokens.filter((t) => containsWordStart(hay, stem(t)));
    s += matched.length * 3;
    if (tokens.length > 1 && matched.length === tokens.length) s += 4;
    s += extra.filter((t) => containsWordStart(hay, t)).length * 2;
    return s;
  };
  const hits: Hit[] = [];
  for (const p of lib.phrases) {
    const s = score(`${p.da} ${p.ua} ${p.explanation_ua ?? ''}`);
    if (s > 0) hits.push({ kind: 'phrase', id: p.id, chapter_id: p.chapter_id, da: p.da, ua: p.ua, score: s + 1 });
  }
  for (const m of lib.messages) {
    const s = score(`${m.da} ${m.ua} ${m.audience_ua}`);
    if (s > 0) hits.push({ kind: 'message', id: m.id, chapter_id: m.chapter_id, da: m.da, ua: m.ua, audience: m.audience_ua, score: s });
  }
  for (const v of lib.vocab) {
    const s = score(`${v.da} ${v.ua}`);
    if (s >= 3) hits.push({ kind: 'vocab', id: v.id, chapter_id: v.chapter_id, da: v.da, ua: v.ua, score: s });
  }
  hits.sort((a, b) => b.score - a.score || a.chapter_id - b.chapter_id);
  // Hide weak synonym-only hits when the query also matched words directly.
  const best = hits[0]?.score ?? 0;
  return hits.filter((h) => h.score >= (best >= 5 ? 3 : 1)).slice(0, limit);
}

// Whether the query matched the book's own words, or only via synonyms.
export function isExact(lib: Library, query: string) {
  const { q } = expand(query);
  return lib.phrases.some((p) => fold(`${p.da} ${p.ua}`).includes(q));
}

// Chapters related to a query, for the "nothing found" state.
export function relatedChapters(lib: Library, query: string) {
  const { extra, tokens } = expand(query);
  const words = [...extra, ...tokens.map(stem)];
  return lib.chapters
    .map((c) => {
      const text = fold(`${c.title_da} ${c.description_ua} ${c.intro_ua}`);
      return { c, s: words.filter((w) => containsWordStart(text, w)).length };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.c);
}
