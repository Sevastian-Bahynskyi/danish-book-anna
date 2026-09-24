# DANSK PÅ ARBEJDE, app

Expo (React Native + React Native Web) app. Deployed as a static website to GitHub Pages.

```bash
npm install
npm run web         # dev server
npm run typecheck
npx expo lint
npm run build:web   # static export into dist/ (base path /danish-book-anna)
```

- Routes: `src/app` (Expo Router). `(app)/` needs a signed-in account; `(app)/admin/` needs the admin role.
- Data: `src/lib/content.ts` (the whole book is loaded once after sign-in), `src/lib/search.ts` (keyword search, no AI).
- Auth and the one-session rule: `src/lib/auth.tsx` and `src/lib/supabase.ts`.
- Design tokens (the "Messenger від Анни" style): `src/theme/tokens.ts`.
- React Bits components (web only) live in `src/components/reactbits`; `src/components/effects` wraps them with native fallbacks and reduced-motion support.
