# Visual identity: "Messenger від Анни"

The style was picked by the client from five prototype variants (variant 3), with the "more animation" option. The idea comes from the spec: explanations should sound "as if Anna were explaining something personally in Messenger". Anna's notes and the dialogues look like chat bubbles. Everything else looks like a calm, high-quality digital textbook.

The source of truth is the code: `client/src/theme/tokens.ts` holds the colours, fonts, radii and spacing, and `client/src/components/ui.tsx` and `book.tsx` hold the components. This file explains the rules so new work fits in.

## Personality

- Warm, calm, personal, adult. A cosy textbook, not a game.
- Never childish, gamified (no streaks, points or confetti), corporate, or dark navy.
- Anna's voice: simple conversational Ukrainian, addressed to the reader as «ви». Say "Ви вже зробили перший крок", not "Вітаємо в системі".
- No Anna photo anywhere. "Created by Anna Melnykova" appears as the brand mark in the top bar, the footer, the sign-in screen and the final page.

## Colour

One accent colour: rose/pink. Blue is only for informational surfaces (translations, explanations, hints), never for actions. Every text/background pair meets WCAG AA in both themes, so re-check contrast whenever you change a colour.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FCF0F1` | `#1D1517` | Page background (warm blush cream) |
| `surface` | `#FFFAFA` | `#281D20` | Cards |
| `surface2` | `#FAE6E9` | `#34262B` | Hover and pressed states, segmented control track |
| `ink` | `#33262A` | `#F6E6EA` | Main text, Danish text |
| `muted` | `#735960` | `#C4A5AD` | Secondary text, inactive icons |
| `line` | `#EDD0D6` | `#402F34` | Borders and dividers |
| `ua` | `#3A6190` | `#A2C5EC` | Ukrainian translation text |
| `accent` | `#C95777` | `#EC8CA4` | Primary button (dark theme), sparks, silk |
| `accentInk` | `#932C4B` | `#F5AABD` | Accent text, active tab, primary button (light theme), handwritten headings |
| `onAccent` | `#FFFAFA` | `#2B1219` | Text on accent fills |
| `accentSoft` | `#F9DDE3` | `#3D262D` | "My" chat bubble, selected chips, hero backdrop |
| `info` / `infoSoft` | `#6C93C2` / `#E5EEF9` | `#86AAD6` / `#1F2835` | Explanation blocks, info banners |
| `noteBg` / `noteLine` | `#FFF6EC` / `#F2DCC0` | `#302622` / `#4C3A2E` | «Від перекладача» note (cream, as the spec asks) |
| `ok` / `bad` | `#3E7F50` / `#B03F5A` | `#7DC690` / `#F2899E` | Correct/wrong feedback, mistakes |
| `silk` | `#F4C7D2` | `#5A2D3A` | Colour of the animated silk background |

Theme: the reader chooses Системна / Світла / Темна on the «Ще» page. The choice is stored per device (`dpa.theme` in AsyncStorage/localStorage), and `system` follows the OS. Always use `useTheme().c` and never hard-code a colour in a screen.

## Typography

| Role | Font | Where |
|---|---|---|
| Text and UI | **Nunito** (400/600/700/800) | Everything |
| Handwritten accent | **Neucha** | `Hand`: sparingly, for «Від перекладача», dialogue titles, the "Anna" signature, "by Anna Melnykova" |

Both fonts support Cyrillic and Danish letters (æ ø å).

Scale (`ui.tsx`):
- `H1` 38/44 heavy, −0.5 letter spacing. The home hero is 54 on wide screens and 36 on phones.
- `H2` 28/34 heavy.
- `H3` 21/27 bold.
- `Body` 17/26.
- `Muted` for secondary text.
- UI labels 15 bold. Tab labels 12 bold.

A Danish/Ukrainian pair (`DaUa`) always puts Danish first, in bold `ink`, with Ukrainian right below it, semibold in `ua` blue. The two are visually distinct, but Ukrainian must never look secondary: never make it grey or small. The flags are drawn in CSS (`Flag`) because emoji flags show up as letters on Windows.

## Shape and space

- Radii: pills (999) for every control. Cards 24, inner surfaces 18.
- Chat bubbles are 20 with one 6px "tail" corner. Mine: the top-right corner is the tail and the fill is `accentSoft`. Theirs: the top-left corner is the tail, with `surface` fill and a border.
- Spacing uses a 4px grid (`space(n)`). Cards have 20px padding.
- The page max width is 1120. The layout switches from the phone tab bar to top navigation at 900px (`WIDE`).
- Cards: `surface` with a 1px `line` border and a very soft rose shadow (`0 18px 36px -26px`).
- Touch targets are at least 44px (tabs 50).

## Components that carry the identity

- **AnnaNote**: a round "A" avatar plus a cream bubble, «Від перекладача» in Neucha, and a lightbulb. Signed "Anna".
- **DialogueView**: chat bubbles with the speaker's name above. The translation is hidden until «Показати переклад».
- **PhraseRow**: numbered textbook row with Danish then Ukrainian, ❤ Зберегти, and an expandable «Пояснення».
- **MistakeCard**: ✗ the wrong phrase struck through, ✓ the better phrase, 💡 «Чому?» after a dashed divider.
- **MessageCard**: message bubble with the tail at the bottom right, «Скопіювати» plus save.
- **Quiz**: radio options with immediate «Правильно!» / «Спробуйте ще раз».
- **ChapterCard**: Danish title, Ukrainian description, phrase count, and a check when done.
- **Navigation**:
  - On phones, a glass bottom tab bar (Головна, Розділи, Пошук, Збережені, Ще).
  - On wide screens, a glass top bar with the same items as pills.
  - The progress pill «x / 12 kapitler» is always in the top bar.
  - Glass is only used on these bars, never on content.
- **Icons**: Phosphor (`phosphor-react-native`, `*Icon` names). Regular weight when inactive, fill when active, duotone for the lightbulb. No emoji in the UI chrome.

## Motion

The client chose "анімації: більше", so the site uses React Bits effects even though the spec says "almost no animation". The rule that reconciles the two: motion is decorative and slow, never blocks reading, and turns off completely with the OS "reduce motion" setting (`useReducedMotion`).

| Effect | Wrapper (`components/effects`) | Where |
|---|---|---|
| Silk (WebGL, lazy-loaded three.js) | `SilkBackground` | Home hero and sign-in backdrop |
| BlurText | `BlurHeading` | Home and final-page headlines |
| FadeContent (GSAP ScrollTrigger) | `Reveal` | Sections fading in on scroll |
| SpotlightCard | `Spotlight` | Chapter cards: cursor spotlight on desktop |
| ClickSpark | `Spark` | ❤ Зберегти |
| CountUp | `Count` | Progress numbers (top-bar pill, «continue» card) |
| Soft fade | `FadeEdge` | Bottom edge of the hero |

The React Bits sources are vendored in `client/src/components/reactbits` (web only). Each wrapper has a `.web.tsx` version and a plain native fallback.

## App icon

Two chat bubbles on the rose gradient: a blue one behind (Ukrainian) and a cream one in front with a handwritten «Hej» (Danish). It follows Apple's icon rules: a full square, no text other than the mark, and readable at 32px.

`client/scripts/make-icons.mjs` generates every size, for the PWA (`client/public/`) and for native (`client/assets/images/`). The PWA name is "Dansk på arbejde", shortened to "Dansk", with theme colour `#FCF0F1`.

## Writing rules for UI copy

- All UI text is in Ukrainian. Danish is only for the learning material.
- No em-dashes (a rule from the taste skill). Use commas, full stops or line breaks.
- Buttons use verbs: «Зберегти», «Показати переклад», «Перевірити», «Додати номер».
- Errors say what to do next, e.g. «Цього номера ще немає у списку. Напишіть Анні в Messenger після покупки, і вона відкриє доступ.»
