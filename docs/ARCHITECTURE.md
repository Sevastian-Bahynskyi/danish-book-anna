# Architecture and runbook

## Map

```
README.md                 what the product is, and how access works (for humans)
CLAUDE.md                 start here (for Claude sessions)
TESTING.md                test account and layout test
docs/
  SPEC.md                 original brief (verbatim)
  DECISIONS.md            what was decided and why
  VISUAL-IDENTITY.md      the "Messenger від Анни" style
  ARCHITECTURE.md         this file
.claude/
  skills/taste, skills/apple-design     design skills, follow them for all UI work
  hooks/session-start.sh               cloud sessions: npm install in client/, EXPO_OFFLINE=1
  settings.json                        registers the hook
.github/workflows/pages.yml            push to main: typecheck, lint, build, deploy to Pages
client/                   Expo app (see below)
  .claude/settings.json   enables the official Expo plugin for sessions opened in client/
supabase/
  migrations/             schema, RLS, functions (applied in order)
  functions/account/      Edge Function: check / register / reset
  content/                source.txt (Anna's text), extras.mjs (the rest), build-seed.mjs
  seed.sql                generated from content/, don't edit by hand
```

## Client (`client/`)

- **Routes** (`src/app`, Expo Router):
  - `login.tsx`: sign in, register and new password.
  - `(app)/` requires a signed-in account:
    - `index` (home), `chapters`, `chapter/[id]` (1–12 are book chapters, 13–14 render the grammar view), `grammar/[id]` (a grammar topic such as `13.1`), `grammar/review` (cheat sheet and final test), `search`, `saved`, `more` («Ще»: theme, about, final page, admin, sign out), `about`, `finish`.
    - `admin/` (admin role only): `index` (stats, add phone, waiting list, users), `user/[id]` (detail, block, end session, reset code, delete).
- **Auth**:
  - `src/lib/auth.tsx`: AuthProvider, sign in/register/reset through the `account` function, and a session watchdog (polls `session_status` every 60 seconds and on window focus).
  - `src/lib/supabase.ts`: a custom fetch that adds `x-session-id` to every request.
- **Data**:
  - `src/lib/content.ts`: the library (whole book), saved items and progress.
  - `src/lib/grammar.ts` + `src/content/grammar.json`: chapters 13–14 (grammar text ships with the app), synced grammar saves and read topics.
  - `src/lib/admin.ts`: admin RPC hooks.
  - `src/lib/search.ts`: folding, synonyms, `POPULAR` and `SITUATIONS` quick searches.
- **UI**:
  - `src/theme` holds the tokens and the ThemeProvider (theme preference).
  - `src/components` holds `ui.tsx` (primitives), `book.tsx` (textbook blocks), `nav.tsx`, `shared.tsx`, `Screen.tsx` and `Tap.tsx`.
  - `effects/` wraps React Bits (`reactbits/`, vendored, excluded from lint).
- **PWA**: `public/index.html` (meta, manifest link, base styles, and an inline script that keeps Chrome's `beforeinstallprompt`), `public/manifest.json`, and the icons made by `scripts/make-icons.mjs`.
- **Install guide**: `src/lib/pwa.ts` (phone/browser detection, install prompt, auto-open) and `src/components/InstallGuide.tsx` (the sheet). It opens once per device on a phone's first entry, from «Ще» → «Показати, як встановити», or with any link ending in `?install`.
- **Commands**: `npm run web`, `typecheck`, `lint`, `build:web` (sets the tree-shaking env flags and copies 404.html), and `test:layout`.

Gotchas that already cost time:
- `<Link asChild>` flattens its child's style, so a function `style` is lost. Use `Tap` with `pressStyle` for hover and pressed states.
- On web, `flex: 1` inside a column collapses (flex-basis 0). Use `flexGrow: 1`. The layout test catches this.
- `FadeContent` / ScrollTrigger must use the RN-web scroll container as its scroller (`useScroller()` from `Screen.tsx`).
- Chapter anchors use `measureLayout` against the body ref.
- Phosphor icons use `*Icon` names (`HeartIcon`, not `Heart`).
- Expo CLI tries api.expo.dev, which is blocked in the cloud sandbox. Set `EXPO_OFFLINE=1` (the session hook does this).

## Database (`supabase/migrations`)

Tables:
- **Content**: `chapters`, `phrases`, `dialogues`, `notes`, `mistakes`, `messages`, `exercises`, `vocab`. Readable only when `private.has_access()`: the account is active and either an admin, or the `x-session-id` header equals `profiles.active_session`.
- **Per user**: `profiles` (role user/admin, status active/blocked, `active_session`, `is_test`), `saved_items`, `progress`, `grammar_saved` (`topic:13.1`, `example:13.1:4`), `grammar_topics_read`, `login_events`.
- Chapters 13–14 have rows in `chapters` (title only) so `progress` and admin stats count them; their text lives in `client/src/content/grammar.json`.
- **Admin only**: `allowed_phones`, `private.reset_codes`.

Functions (all `security definer` with a fixed `search_path`; execute is revoked from public/anon):
- **Readers**: `claim_session(user_agent)` returns the session id, and `session_status(sid)` returns `ok`, `replaced` or `blocked`.
- **Used by the Edge Function with the service key**: `can_register(phone)` returns `first`, `allowed`, `exists` or `not_allowed`. The function also calls `register_profile(uid, phone, display_name)` and `consume_reset_code(phone, code)`.
- **Admin** (each calls `private.assert_admin()`): `admin_users`, `admin_allowed_phones`, `admin_add_phone`, `admin_remove_phone`, `admin_set_status`, `admin_end_session`, `admin_delete_user`, `admin_create_reset_code`, `admin_user_detail`, `admin_stats`. These leave out `is_test` accounts.

Edge Function `account` (`verify_jwt: false`, uses the secret key) takes POST `{action: check | register | reset, …}`.

### Changing things

- **Schema**: add a new file `supabase/migrations/<timestamp>_<name>.sql`, then apply it with the Supabase MCP `apply_migration` (project `yojtljapcpcpqddukzxg`). Never edit an applied migration.
- **Content**: edit `supabase/content/source.txt` or `extras.mjs`, then run `node supabase/content/build-seed.mjs` to regenerate `seed.sql`. `build-seed.mjs --json <file>` also writes the library as JSON (the layout test uses this).
  - ⚠️ **Don't re-apply `seed.sql` on the live database now that readers exist.** It runs `truncate public.chapters restart identity cascade`, and that cascades through the progress table's link to chapters, so **every reader's progress would be deleted**. It also renumbers phrases and messages, so `saved_items` (which stores ids, not foreign keys) would point to the wrong phrases.
  - For live content changes, write targeted `update` / `insert` statements that keep the existing ids, as a migration or through `execute_sql`, and keep `extras.mjs` / `source.txt` in sync so the repo stays the source of truth.
- **Edge Function**: edit `supabase/functions/account/index.ts`, then deploy with the Supabase MCP `deploy_edge_function` (name `account`, `verify_jwt: false`).
- **App**: push to `main` to deploy. Check the run in GitHub Actions ("Deploy to GitHub Pages").

## Environment facts (cloud sessions)

- The sandbox **can't reach** `*.supabase.co` or `*.github.io` over HTTP. To test the live API, go through the Supabase MCP `execute_sql`: install the `http` extension temporarily, call the REST/Auth endpoints with the test account, then `drop extension http`.
- Chromium for Playwright is preinstalled at `/opt/pw-browsers` (don't run `playwright install`). `playwright` is a devDependency of `client/`.
- Connectors used: **GitHub MCP** (Actions runs and logs, no `gh` CLI), **Supabase MCP** (SQL, migrations, functions, logs, advisors), and the **Expo** plugin/MCP for docs.
- The repo is private. The Pages site is public, but it only shows the sign-in screen until someone signs in.

## Common tasks for Anna (and how to support her)

- **Give a buyer access**: Ще → Адмін-панель → «Відкрити доступ» → phone (+ note) → «Додати номер».
- **Forgotten password**: open the user → «Створити код» → copy the prepared message → Messenger.
- **Someone shares their account**: the one-session rule already logs the other device out. Anna can also «Завершити сесію» or «Заблокувати».
- **Transfer the admin role**: SQL only, `update public.profiles set role = 'admin' where phone = '+45…'` (and demote the old admin).
