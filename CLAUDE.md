# Notes for Claude

**DANSK PÅ ARBEJDE**: a private, paid-access website-book of workplace Danish for Ukrainian speakers, by Anna Melnykova. It's live at https://sevastian-bahynskyi.github.io/danish-book-anna/. Expo (React Native Web) is on GitHub Pages and Supabase is the backend.

## Start here (read before changing anything)

1. [docs/DECISIONS.md](docs/DECISIONS.md): what was decided and why. Don't reopen settled questions; add a new entry when something changes.
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): repo map, data model, how to change schema, content and functions, and environment facts.
3. [docs/VISUAL-IDENTITY.md](docs/VISUAL-IDENTITY.md): the "Messenger від Анни" style. All UI must match it.
4. [docs/SPEC.md](docs/SPEC.md): the original brief.
5. [TESTING.md](TESTING.md): the test account and the layout test.

## Skills and tools to use

- **UI work**: load the project skills `taste` and `apple-design` (in `.claude/skills/`) and follow them. That means HIG navigation, 44px targets, AA contrast, dark mode, no em-dashes, no generic templated look.
- **Expo**: the official Expo plugin is enabled in `client/.claude/settings.json`, and the Expo MCP has docs search. Expo SDK 57 and Expo Router.
- **Supabase MCP** (project ref `yojtljapcpcpqddukzxg`): `apply_migration`, `execute_sql`, `deploy_edge_function`, `query_logs`, `get_advisors`.
- **GitHub MCP**: Actions runs and logs. There is no `gh` CLI.
- **Playwright** with the preinstalled Chromium (`/opt/pw-browsers`) for screenshots and `npm run test:layout`.
- A SessionStart hook (`.claude/hooks/session-start.sh`) runs `npm install` in `client/` and sets `EXPO_OFFLINE=1` in cloud sessions.

## Rules

- Language: all UI text is in Ukrainian (simple, warm, «ви»). Danish is only for learning material, and Danish always comes first with Ukrainian right below.
- There is **no AI, no PDF or download, and no audio** (audio is deferred). Don't add them unless the owner asks.
- Never touch real users' accounts. To try the live app, use the hidden test account in `TESTING.md`. The sandbox can't reach `*.supabase.co`, so go through `execute_sql` with the `http` extension, and drop the extension afterwards.
- Before pushing UI changes, run `npm run typecheck`, `npm run lint`, `npm run build:web` and `npm run test:layout` in `client/`.
- On web, `flex: 1` inside a column collapses to zero height (flex-basis 0). Use `flexGrow: 1` unless the parent has a fixed height. Use `Tap` + `pressStyle` rather than a function `style` under `<Link asChild>`.
- Colours come only from `useTheme().c`. Motion goes through `components/effects` wrappers, which respect reduce motion.
- New DB changes go in a new migration file, applied with the Supabase MCP. Never edit applied migrations. **Never re-run `supabase/seed.sql` on live data** (it wipes progress; see ARCHITECTURE.md).
- Deploy: a push to `main` builds and publishes GitHub Pages (`.github/workflows/pages.yml`). Work on the session's branch, then fast-forward `main` (`git push origin <branch>:main`), and check that the Actions run is green. Don't open PRs unless asked.
- Don't put model names in commits or docs.
