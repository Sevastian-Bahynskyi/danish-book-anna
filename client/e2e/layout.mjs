// Phone-width layout check against the built site (client/dist) with a mocked
// backend: signs in as a fake admin, opens the main screens at several widths
// and in both themes, and fails when sibling blocks overlap each other or the
// page scrolls sideways. Run: npm run build:web && npm run test:layout
import { createServer } from 'node:http';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const base = '/danish-book-anna';
const shots = process.env.SHOTS; // optional folder for screenshots
if (!existsSync(join(dist, 'index.html'))) throw new Error('Build first: npm run build:web');

// ---------------------------------------------------------------- content
const libFile = join(root, 'node_modules', '.cache', 'dpa-library.json');
mkdirSync(dirname(libFile), { recursive: true });
execFileSync('node', [join(root, '..', 'supabase', 'content', 'build-seed.mjs'), '--json', libFile], { stdio: 'ignore' });
const lib = JSON.parse(readFileSync(libFile, 'utf8'));

// ---------------------------------------------------------------- static server
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.startsWith(base)) p = p.slice(base.length);
  let file = join(dist, p);
  if (!existsSync(file) || p.endsWith('/')) file = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

// ---------------------------------------------------------------- mocked backend
const env = readFileSync(join(root, '.env'), 'utf8');
const supaUrl = env.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const ref = new URL(supaUrl).hostname.split('.')[0];
const uid = '00000000-0000-4000-8000-000000000001';
const now = new Date().toISOString();
const ago = (m) => new Date(Date.now() - m * 60000).toISOString();
const profile = { id: uid, phone: '+4512345678', display_name: 'Анна', role: 'admin', status: 'active' };
const users = [
  { id: uid, phone: '+4512345678', display_name: 'Анна', role: 'admin', status: 'active', online: true, last_login_at: now, last_seen_at: now, created_at: ago(9000), chapters_done: 12, saved: 14, logins: 31 },
  { id: '00000000-0000-4000-8000-000000000002', phone: '+4587654321', display_name: 'Олена Коваленко-Петренко', role: 'user', status: 'active', online: false, last_login_at: ago(300), last_seen_at: ago(5), created_at: ago(4000), chapters_done: 3, saved: 2, logins: 4 },
  { id: '00000000-0000-4000-8000-000000000003', phone: '+4522334455', display_name: null, role: 'user', status: 'blocked', online: false, last_login_at: null, last_seen_at: null, created_at: ago(100), chapters_done: 0, saved: 0, logins: 0 },
];
const rpc = {
  session_status: 'ok',
  claim_session: 'sid-test',
  admin_users: users,
  admin_allowed_phones: [
    { phone: '+4511112222', note: 'Марія, з групи у вівторок', added_at: ago(60), registered: false },
    { phone: '+4533334444', note: null, added_at: ago(600), registered: false },
    { phone: '+4587654321', note: 'Олена', added_at: ago(5000), registered: true },
  ],
  admin_stats: {
    users: 2, blocked: 1, waiting: 2, active_7d: 1, logins_30d: 17, finished_all: 1, saved_total: 16,
    chapters: lib.chapters.map((c, i) => ({ id: c.id, title_da: c.title_da, visited: 3 - (i % 3), completed: 2 - (i % 3) })),
  },
  admin_user_detail: {
    profile: users[1],
    progress: lib.chapters.slice(0, 4).map((c, i) => ({ chapter_id: c.id, visited_at: ago(100 * i), completed_at: i < 3 ? ago(90 * i) : null })),
    logins: [{ at: ago(300), user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' }],
    saved: 2,
    reset_pending: false,
  },
};
const tables = {
  ...lib,
  profiles: profile,
  saved_items: [{ kind: 'phrase', item_id: 1, created_at: now }, { kind: 'message', item_id: 1, created_at: now }],
  progress: [{ chapter_id: 1, visited_at: now, completed_at: now }, { chapter_id: 2, visited_at: now, completed_at: null }],
};
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: uid, role: 'authenticated', exp })}.sig`;
const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'p4512345678@phone.dansk-paa-arbejde.app', user_metadata: {}, app_metadata: {}, created_at: now };
const session = { access_token: token, refresh_token: 'r', token_type: 'bearer', expires_in: 86400, expires_at: exp, user };

async function mockBackend(page) {
  await page.route(`${supaUrl}/**`, (route) => {
    const u = new URL(route.request().url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'access-control-allow-origin': '*' } });
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    if (u.pathname.startsWith('/auth/v1/user')) return json(user);
    if (u.pathname.startsWith('/auth/v1/')) return json(session);
    const m = u.pathname.match(/^\/rest\/v1\/(rpc\/)?(\w+)/);
    if (!m) return json({});
    if (m[1]) return json(rpc[m[2]] ?? null);
    if (route.request().method() !== 'GET') return json(null, 201);
    return json(tables[m[2]] ?? []);
  });
  await page.addInitScript(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('dpa.session-id', 'sid-test');
  }, { key: `sb-${ref}-auth-token`, session });
}

// ---------------------------------------------------------------- the check
// Every element's in-flow children must not overlap each other, and nothing may
// stick out past the right edge of the screen.
function findProblems() {
  const out = [];
  const vw = document.documentElement.clientWidth;
  const inFlow = (el) => {
    const s = getComputedStyle(el);
    // Inline text runs (bold words inside a sentence) wrap across lines and may share a box.
    if (s.position === 'absolute' || s.position === 'fixed' || s.display === 'none' || s.display === 'inline' || s.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const label = (el) => (el.getAttribute('aria-label') || el.innerText || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
  for (const parent of document.querySelectorAll('#root *')) {
    if (parent.closest('[aria-hidden="true"], canvas, svg')) continue;
    const kids = [...parent.children].filter(inFlow);
    for (let i = 0; i < kids.length; i++) {
      const a = kids[i].getBoundingClientRect();
      for (let j = i + 1; j < kids.length; j++) {
        const b = kids[j].getBoundingClientRect();
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (x > 2 && y > 2) out.push(`overlap: «${label(kids[i])}» and «${label(kids[j])}» (${Math.round(x)}×${Math.round(y)}px)`);
      }
    }
  }
  for (const el of document.querySelectorAll('#root *')) {
    if (!inFlow(el) || el.closest('[aria-hidden="true"]')) continue;
    // Horizontal scrollers (chip rows) may extend past the edge on purpose.
    let p = el.parentElement, scrolls = false;
    while (p) { const ox = getComputedStyle(p).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') { scrolls = true; break; } p = p.parentElement; }
    if (!scrolls && el.getBoundingClientRect().right > vw + 1) out.push(`off-screen: «${label(el)}» ends at ${Math.round(el.getBoundingClientRect().right)}px, screen is ${vw}px`);
  }
  return [...new Set(out)];
}

const screens = ['/', '/chapters', '/chapter/1', '/chapter/7', '/search?q=syg', '/saved', '/more', '/about', '/finish', '/admin', `/admin/user/${users[1].id}`];
const widths = (process.env.WIDTHS ?? '320,375,430,1280').split(',').map(Number);
const themes = ['light', 'dark'];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
let failures = 0;
for (const width of widths) {
  for (const theme of themes) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await mockBackend(page);
    await page.addInitScript((t) => localStorage.setItem('dpa.theme', t), theme);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const s of screens) {
      await page.goto(origin + base + s);
      await page.waitForFunction(() => document.querySelector('#root')?.innerText.length > 40, null, { timeout: 20000 });
      await page.waitForTimeout(700);
      const problems = [...(await page.evaluate(findProblems)), ...errors.splice(0).map((e) => `page error: ${e}`)];
      if (shots) {
        mkdirSync(shots, { recursive: true });
        await page.screenshot({ path: join(shots, `${width}-${theme}${s.replace(/[^a-z0-9]+/gi, '_')}.png`), fullPage: true });
      }
      const tag = `${String(width).padStart(4)}px ${theme.padEnd(5)} ${s}`;
      if (problems.length) {
        failures += problems.length;
        console.log(`✗ ${tag}\n  - ${problems.join('\n  - ')}`);
      } else console.log(`✓ ${tag}`);
    }
    await ctx.close();
  }
}
// The install guide («Книжка на екрані телефону») as each kind of phone sees it.
const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphone26: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1',
  iphoneMessenger: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 [FBAN/MessengerForiOS;FBAV/500.0]',
  android: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  samsung: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
  androidMessenger: 'Mozilla/5.0 (Linux; Android 14; K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/500.0;]',
};
const guides = [
  ['iphone', UA.iphone, false],
  ['iphone-ios26', UA.iphone26, false],
  ['iphone-chrome', UA.iphoneChrome, false],
  ['iphone-messenger', UA.iphoneMessenger, false],
  ['android-install', UA.android, true],
  ['android-menu', UA.android, false],
  ['android-samsung', UA.samsung, false],
  ['android-messenger', UA.androidMessenger, false],
  ['desktop', undefined, false],
];
for (const [name, userAgent, prompt] of guides) {
  for (const [w, h] of [[320, 568], [390, 664]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, userAgent, deviceScaleFactor: 1, reducedMotion: 'reduce', hasTouch: !!userAgent });
    const page = await ctx.newPage();
    await mockBackend(page);
    if (prompt) await page.addInitScript(() => { window.__dpaInstall = Object.assign(new Event('beforeinstallprompt'), { prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'accepted' }) }); });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(origin + base + '/?install');
    await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
    await page.waitForTimeout(500);
    const problems = [...(await page.evaluate(findProblems)), ...errors.map((e) => `page error: ${e}`)];
    // The sheet's buttons outside its scrolling part must stay on screen.
    const offscreen = await page.evaluate(() =>
      [...document.querySelectorAll('[role="dialog"] [role="button"]')]
        .filter((b) => {
          for (let p = b.parentElement; p; p = p.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(p).overflowY)) return false;
          const r = b.getBoundingClientRect();
          return r.bottom > innerHeight + 1 || r.top < -1;
        })
        .map((b) => b.getAttribute('aria-label')),
    );
    problems.push(...offscreen.map((l) => `guide button off screen: «${l}»`));
    if (shots) await page.screenshot({ path: join(shots, `guide-${name}-${w}.png`) });
    const tag = `guide ${name} ${w}px`;
    if (problems.length) {
      failures += problems.length;
      console.log(`✗ ${tag}\n  - ${problems.join('\n  - ')}`);
    } else console.log(`✓ ${tag}`);
    await ctx.close();
  }
}

await browser.close();
server.close();
if (failures) {
  console.log(`\n${failures} layout problem(s)`);
  process.exit(1);
}
console.log('\nNo layout problems');
