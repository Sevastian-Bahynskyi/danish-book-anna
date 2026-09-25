# Decisions log

Everything that was decided, and why, so a new session doesn't reopen settled questions. The newest entries are at the bottom. To change a decision, add a new entry instead of editing an old one.

People:
- **Owner/developer**: the repo owner (GitHub `Sevastian-Bahynskyi`), who talks to Claude.
- **Anna Melnykova**: the author and the admin of the live site.

The original brief is [SPEC.md](SPEC.md).

## Product

| # | Decision | Why |
|---|---|---|
| P1 | The product is the private website-book described in the spec: 12 chapters, Danish first then Ukrainian, UI in Ukrainian. | Spec |
| P2 | **No audio for now.** The spec's audio sections are left out, and there is no player UI. If audio is added later, it should be streamed only, not downloadable (spec §7). | Owner: "for now we don't implement audio" |
| P3 | **No AI of any kind, and no PDF or download.** Search uses keywords and synonyms (`client/src/lib/search.ts`). Printing shows only a notice (`global.css` `@media print`). | Spec §30–31 |
| P4 | The content in `supabase/content/extras.mjs` (intros, explanations, «Від перекладача» notes, dialogues, mistakes, messages, exercises, vocabulary) was written by Claude around Anna's 305 phrases. **Anna should proofread it.** | Her source text only had the phrases |
| P5 | The site is not indexed by search engines (no `noindex` yet), and the domain stays `sevastian-bahynskyi.github.io/danish-book-anna`. A custom domain was offered and turned down. | Owner: "Leave as it is" |

## Access and accounts

| # | Decision | Why |
|---|---|---|
| A1 | Sign-in uses phone + password. Supabase Auth stores the phone as a synthetic email `p<digits>@phone.dansk-paa-arbejde.app`, so no SMS provider is needed. An 8-digit number is treated as Danish (+45). | Spec §25; SMS costs money |
| A2 | **The first account to register becomes admin.** There is no UI to move the admin role. That needs SQL (`update profiles set role=…`). | Owner |
| A3 | Anyone else can register only if Anna added their phone number first (`allowed_phones`). | Spec §25 |
| A4 | Regular readers get **one active session**. A new sign-in calls `claim_session()`, which creates a new session id and deletes the account's other Supabase sessions. Row level security serves content only when the `x-session-id` header matches `profiles.active_session`. The old device notices within 60 seconds or on window focus and shows «Ви увійшли на іншому пристрої». | Spec §27 |
| A5 | **Admins are exempt from the one-session rule** and can sign in on any number of devices. | Owner, 2026-09-24 |
| A6 | Password reset: in the admin panel Anna creates a 6-digit code (bcrypt-hashed, valid 48 hours, at most 5 attempts). She sends it in Messenger, and the reader sets a new password with it on the sign-in screen («Новий пароль»). | Spec §28 |
| A7 | Access never expires on its own. Anna can block, unblock, delete a reader or end their session. | Spec §29 |
| A8 | **Hidden test account** (`profiles.is_test = true`): an admin, left out of the user list and the statistics, and never counted as "the first account". The credentials are in [../TESTING.md](../TESTING.md). It is managed only with SQL. | Owner: Claude needs a way to test the live app |

## Technology

| # | Decision | Why |
|---|---|---|
| T1 | **Expo SDK 57 (React Native + React Native Web) and Expo Router**, exported as a static single-page web app. | Owner asked for React Native. The same code could ship as a native app later. |
| T2 | **Hosting: GitHub Pages**, deployed by `.github/workflows/pages.yml` on every push to `main`. The site lives under the base path `/danish-book-anna` (`app.json` `experiments.baseUrl`). `404.html` is a copy of `index.html` so deep links work. | Owner |
| T3 | **Backend: Supabase** (project `dansk-paa-arbejde`, ref `yojtljapcpcpqddukzxg`, eu-north-1). It provides Postgres + row level security, Auth, and one Edge Function (`account`). The browser only has the publishable key (`client/.env`, which is committed on purpose). | Free tier, real content protection |
| T4 | The whole book (a few hundred rows) is loaded once after sign-in with TanStack Query and kept in memory. Chapters open instantly and search runs on the client. | Small data, fast UX |
| T5 | **React Bits** effects are vendored as source (`components/reactbits`), web only, and wrapped with native and reduced-motion fallbacks in `components/effects`. | Owner: "use react bits heavily" |
| T6 | Tree shaking is turned on (`EXPO_UNSTABLE_TREE_SHAKING=1`) and three.js is lazy-loaded. This took the main bundle from about 8 MB to about 600 KB gzipped. | Performance on phones |
| T7 | The PWA is installable (manifest plus Apple meta tags), full screen with its own icon. It has no service worker and no offline mode. | Owner asked for a PWA icon; offline caching would complicate the session rule |
| T8 | Design skills `taste` and `apple-design` are installed in `.claude/skills/`, and every UI change should follow them. | Owner |
| T9 | Phosphor icons, Nunito and Neucha fonts. | Chosen with the style |
| T10 | **Install guide.** On a phone's first entry the book opens a guide fitted to the phone and browser. Android Chrome/Samsung (and desktop Chrome/Edge): one «Встановити» button that opens the browser's own install dialog. iPhone Safari/Chrome: numbered steps with pictures and an arrow pointing at the real Share button (iOS 26 «•••», iPad and Chrome at the top). Messenger/Facebook in-app browsers and other browsers: one button that reopens the site in Safari (`x-safari-https:`) or Chrome (`intent:`), plus copy address. It is repeatable from «Ще» and via `?install`. iPhone can't be installed by code, so steps are the minimum there. Still no service worker (T7). | Owner: readers are 30 to 60 and not technical, so as few taps as possible |

## Design

| # | Decision | Why |
|---|---|---|
| D1 | Out of five prototype variants (in the revised set: 1 Розмовник, 2 Скандинавський ранок, 3 Messenger від Анни, 4 Зошит у клітинку, 5 Скло і світло), the client picked **3 · Messenger від Анни, анімації: більше**. The prototype has since been deleted. | Client choice |
| D2 | There is more motion than the spec's "almost no animation", because the owner asked for React Bits. It stays slow and decorative and is switched off by reduce motion. | Owner overrides spec §24 |
| D3 | Light and dark themes. The reader picks Системна / Світла / Темна on the «Ще» page, saved per device. | Owner, 2026-09-24 |
| D4 | Phones get a bottom tab bar, and screens of 900px or wider get top navigation. Glass is only used on the bars. | apple-design skill (HIG) |
| D5 | No em-dashes in the copy, and no emoji in the UI chrome (icons and CSS flags instead). | taste skill; flag emoji break on Windows |

See [VISUAL-IDENTITY.md](VISUAL-IDENTITY.md) for the full style.

## Process

| # | Decision | Why |
|---|---|---|
| R1 | Work on a feature branch, then fast-forward `main` to deploy (`git push origin <branch>:main`). The owner merges without PRs unless they ask for one. | How the owner works |
| R2 | The GitHub default branch should be `main`. The owner has to switch it in Settings, because Claude's tools can't change repository settings. | Tooling limit |
| R3 | Before any UI push, run typecheck, lint, build and `npm run test:layout` (phone-width overlap check). This was added after an overlap bug on phones made «Додати номер» unreachable. | Bug on 2026-09-24 |
| R4 | Never touch real users' accounts, and test with the hidden test account. Temporary database extensions (e.g. `http`, used for live API tests) must be dropped afterwards. | Owner |

## Change history

- **2026-09-25**
  - Grammar added as chapters 13–14 in the chapter list, not a separate section. Their text ships with the app (`grammar.json`); rows in `chapters` let progress sync and count in admin stats (the book is now 14 chapters, and "finished all" means 14).
  - Grammar saves and read topics sync to Supabase (`grammar_saved`, `grammar_topics_read`); anything saved on a device before sync is imported once.
  - All grammar examples use pre-generated Jeppe audio (same voice and speed as the book); device speech was removed.
  - After signing in, a deep link opens the page it pointed to instead of Home.

- **2026-09-24**
  - Prototype with 5 variants, then revised with the design skills.
  - Style 3 chosen and the full site built.
  - Merged to `main` and prototype removed.
  - PWA icon added.
  - Custom domain declined.
  - Fixed the admin card overlap on phones.
  - Admins exempt from the one-session rule.
  - Hidden test account added.
  - Theme picker added.
  - Layout test and handover docs added.
  - Install guide for iPhone and Android, auto-shown once and in «Ще».
