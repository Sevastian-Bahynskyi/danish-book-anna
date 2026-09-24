# DANSK PÅ ARBEJDE

A private interactive website-book of practical workplace Danish for Ukrainian speakers. Created by Anna Melnykova.

## Status

**Stage 1 is the style prototype** (`prototype/index.html`). It shows five visual variants of the same sample screens (home, chapter index, chapter page, saved phrases, login, completion).

- Switch variants with the bar at the top or the ← → keys.
- ✨ toggles animations between "спокійно" (calm, the spec default) and "більше" (more React Bits-style effects).
- ◐ cycles the colour theme: system, light, dark.
- **Обрати цей** copies your choice so you can paste it into the chat.

Open it locally by double-clicking `prototype/index.html`, or on GitHub Pages:
https://sevastian-bahynskyi.github.io/danish-book-anna/

Direct links: `#phrasebook`, `#nordic`, `#messenger`, `#notebook`, `#glass`.

**Stage 2** is the full app (Expo / React Native Web + Supabase), built in the chosen style.

## Design skills

The project's Claude Code skills live in `.claude/skills/`:

- `taste`: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT). Anti-template frontend rules.
- `apple-design`: [dickwu/apple-design-skill](https://github.com/dickwu/apple-design-skill). Review against Apple's Human Interface Guidelines.

Icons are a vendored subset of [Phosphor Icons](https://phosphoricons.com) (MIT) in `prototype/vendor/phosphor/`.
