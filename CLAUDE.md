# Notes for Claude

- To try the live app, use the test account in `TESTING.md`. Never touch real users' accounts.
- Before pushing UI changes, run `npm run typecheck`, `npm run lint`, `npm run build:web` and `npm run test:layout` in `client/`.
- On web, `flex: 1` inside a column collapses to zero height (flex-basis 0). Use `flexGrow: 1` unless the parent has a fixed height.
- Deploy: a push to `main` builds and publishes GitHub Pages (`.github/workflows/pages.yml`).
