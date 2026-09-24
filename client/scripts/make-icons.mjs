// Draws the app icon (two chat bubbles: Ukrainian behind, Danish "Hej" in front)
// as SVG and renders every size the app and the PWA use.
// Usage (needs Playwright + Chromium): node scripts/make-icons.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const fontDir = path.join(root, 'node_modules/@expo-google-fonts/neucha/400Regular');
const hand = fs.readFileSync(path.join(fontDir, fs.readdirSync(fontDir).find((f) => f.endsWith('.ttf')))).toString('base64');

// Speech bubble: rounded rectangle with a soft tail at the bottom (left or right).
function bubble(x, y, w, h, r, side) {
  const b = y + h;
  if (side === 'left') {
    return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${b - r} Q${x + w},${b} ${x + w - r},${b}
      H${x + r * 1.6} C${x + r * 1.1},${b} ${x + r * 0.55},${b + r * 0.55} ${x},${b + r * 0.7}
      C${x + r * 0.28},${b + r * 0.2} ${x + r * 0.2},${b - r * 0.1} ${x},${b - r * 0.55} V${y + r} Q${x},${y} ${x + r},${y} Z`;
  }
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${b - r * 0.55}
      C${x + w - r * 0.2},${b - r * 0.1} ${x + w - r * 0.28},${b + r * 0.2} ${x + w},${b + r * 0.7}
      C${x + w - r * 0.55},${b + r * 0.55} ${x + w - r * 1.1},${b} ${x + w - r * 1.6},${b}
      H${x + r} Q${x},${b} ${x},${b - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
}

// The mark on a 1024 grid, centred. scale shrinks it for safe zones.
function mark({ scale = 1, mono = false } = {}) {
  const back = bubble(372, 228, 452, 318, 104, 'right');
  const front = bubble(200, 404, 520, 360, 118, 'left');
  const t = `translate(512 512) scale(${scale}) translate(-512 -522)`;
  const backFill = mono ? '#FFFFFF' : '#CFE1F6';
  const frontFill = mono ? '#FFFFFF' : '#FFF8F5';
  return `<g transform="${t}">
    <path d="${back}" fill="${backFill}" fill-opacity="${mono ? 0.55 : 0.92}"/>
    <g fill="${mono ? '#FFFFFF' : '#FFFFFF'}" opacity="${mono ? 0 : 0.9}">
      <circle cx="530" cy="318" r="21"/><circle cx="600" cy="318" r="21"/><circle cx="670" cy="318" r="21"/>
    </g>
    <path d="${front}" fill="${frontFill}"/>
    ${mono ? '' : `<text x="460" y="642" text-anchor="middle" font-family="Hand" font-size="238" fill="#9A2E4F">Hej</text>`}
  </g>`;
}

const bg = `<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#EE9CB0"/><stop offset="0.55" stop-color="#CF5F80"/><stop offset="1" stop-color="#9E3353"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.25" cy="0.15" r="0.75"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
</defs>`;

function svg({ size = 1024, background = true, rounded = false, scale = 1, mono = false, solid = null, noMark = false }) {
  const rx = rounded ? 1024 * 0.2237 : 0;
  const fill = solid ? `<rect width="1024" height="1024" fill="${solid}"/>` : background ? `<rect width="1024" height="1024" rx="${rx}" fill="url(#g)"/><rect width="1024" height="1024" rx="${rx}" fill="url(#glow)"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
    <style>@font-face{font-family:Hand;src:url(data:font/ttf;base64,${hand})}</style>${bg}${fill}${solid || noMark ? '' : mark({ scale, mono })}</svg>`;
}

const A = path.join(root, 'assets/images/');
const P = path.join(root, 'public/');
const outs = [
  { size: 1024, path: A + 'icon.png' }, // iOS / app stores: full-bleed square, the system rounds it
  { size: 256, rounded: true, path: A + 'favicon.png' }, // Expo builds favicon.ico from this
  { size: 512, background: false, scale: 0.95, path: A + 'splash-icon.png' },
  { size: 1024, background: false, scale: 0.62, path: A + 'android-icon-foreground.png' },
  { size: 1024, noMark: true, path: A + 'android-icon-background.png' },
  { size: 1024, background: false, scale: 0.62, mono: true, path: A + 'android-icon-monochrome.png' },
  { size: 180, path: P + 'apple-touch-icon.png' }, // Safari "Add to Home Screen"
  { size: 192, rounded: true, path: P + 'icon-192.png' },
  { size: 512, rounded: true, path: P + 'icon-512.png' },
  { size: 512, scale: 0.78, path: P + 'icon-maskable-512.png' }, // Android adaptive: mark inside the safe zone
  { size: 32, rounded: true, path: P + 'favicon-32.png' },
];
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const o of outs) {
  const p = await b.newPage({ viewport: { width: o.size, height: o.size } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg(o)}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: o.path, omitBackground: true });
  await p.close();
}
await b.close();
