// "Messenger від Анни": the style chosen from the prototype variants.
// Pink is the single accent (actions, saved, progress); blue is only for
// informational surfaces (explanations, translations). Every text colour
// pair here was checked for WCAG AA.
export const palette = {
  light: {
    bg: '#FCF0F1',
    surface: '#FFFAFA',
    surface2: '#FAE6E9',
    ink: '#33262A',
    muted: '#735960',
    line: '#EDD0D6',
    ua: '#3A6190',
    accent: '#C95777',
    accentInk: '#932C4B',
    onAccent: '#FFFAFA',
    accentSoft: '#F9DDE3',
    info: '#6C93C2',
    infoSoft: '#E5EEF9',
    noteBg: '#FFF6EC',
    noteLine: '#F2DCC0',
    ok: '#3E7F50',
    bad: '#B03F5A',
    silk: '#F4C7D2',
    shadow: 'rgba(160, 80, 100, 0.18)',
  },
  dark: {
    bg: '#1D1517',
    surface: '#281D20',
    surface2: '#34262B',
    ink: '#F6E6EA',
    muted: '#C4A5AD',
    line: '#402F34',
    ua: '#A2C5EC',
    accent: '#EC8CA4',
    accentInk: '#F5AABD',
    onAccent: '#2B1219',
    accentSoft: '#3D262D',
    info: '#86AAD6',
    infoSoft: '#1F2835',
    noteBg: '#302622',
    noteLine: '#4C3A2E',
    ok: '#7DC690',
    bad: '#F2899E',
    silk: '#5A2D3A',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

export type Colors = { [K in keyof typeof palette.light]: string };

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  hand: 'Neucha_400Regular',
} as const;

// One radius system: pills for controls, 24 for cards, 18 for inner surfaces.
export const radius = { card: 24, inner: 18, pill: 999, bubble: 20, bubbleTail: 6 } as const;
export const space = (n: number) => n * 4;
export const MAX_WIDTH = 1120;
export const WIDE = 900; // top navigation instead of the bottom tab bar
