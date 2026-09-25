#!/usr/bin/env node
// Generate a repository-local audio library from the same content as build-seed.
// Node 20+, no third-party dependencies. No database calls.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'audio');
const voice = 'da-DK-JeppeNeural';
const format = 'audio-24khz-48kbitrate-mono-mp3';
const minIntervalMs = 3500; // 17 starts/minute, with headroom below F0's 20/60s.
const args = process.argv.slice(2);
const inventoryOnly = args.includes('--inventory');
const sampleOnly = args.includes('--sample');
const envIndex = args.indexOf('--env');
const limitIndex = args.indexOf('--limit');
if ((envIndex >= 0 && !args[envIndex + 1]) || (limitIndex >= 0 && !/^[1-9]\d*$/.test(args[limitIndex + 1] ?? ''))) {
  throw new Error('Usage: node scripts/generate-audio.mjs [--inventory] [--sample] [--env path/to/secrets.env] [--limit N]');
}
const maxNew = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Infinity;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const normalize = (s) => String(s).normalize('NFC').replace(/\s+/g, ' ').trim();
const hash = (s) => createHash('sha256').update(s).digest('hex');
const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

function loadEnv(path) {
  if (!path) return;
  const raw = readFileSync(resolve(path), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*(AZURE_SPEECH_KEY|AZURE_SPEECH_REGION|AZURE_SPEECH_VOICE)\s*=\s*(.*?)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function library() {
  const temp = mkdtempSync(join(tmpdir(), 'danish-audio-'));
  try {
    const target = join(temp, 'library.json');
    const result = spawnSync(process.execPath, [join(root, 'supabase/content/build-seed.mjs'), '--json', target, '--json-only'], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`Content builder failed: ${result.stderr || result.stdout}`);
    return JSON.parse(readFileSync(target, 'utf8'));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function catalog(lib) {
  const byText = new Map();
  function add(text, source) {
    const clean = normalize(text);
    if (!clean) return;
    // Preserve punctuation and case in the hash: these can affect pronunciation.
    const key = hash(JSON.stringify([voice, format, clean])).slice(0, 24);
    const existing = byText.get(clean);
    if (existing) existing.sources.push(source);
    else byText.set(clean, { text: clean, file: `audio/da/${key}.mp3`, sources: [source] });
  }
  for (const x of lib.chapters) add(x.title_da, { kind: 'chapter', chapter_id: x.id, id: x.id });
  for (const x of lib.phrases) add(x.da, { kind: 'phrase', chapter_id: x.chapter_id, id: x.id });
  for (const x of lib.dialogues) x.lines.forEach((line, index) =>
    add(line.da, { kind: 'dialogue_line', chapter_id: x.chapter_id, id: x.id, index }));
  for (const x of lib.mistakes) {
    add(x.wrong, { kind: 'mistake_wrong', chapter_id: x.chapter_id, id: x.id });
    add(x.better, { kind: 'mistake_better', chapter_id: x.chapter_id, id: x.id });
  }
  for (const x of lib.messages) {
    add(x.da, { kind: 'message', chapter_id: x.chapter_id, id: x.id });
    // Long ready-made emails are also available as individual spoken lines.
    x.da.split(/\n+/).forEach((line, index) =>
      add(line, { kind: 'message_line', chapter_id: x.chapter_id, id: x.id, index }));
  }
  for (const x of lib.exercises) x.options.forEach((option, index) =>
    add(option, { kind: 'exercise_option', chapter_id: x.chapter_id, id: x.id, index }));
  for (const x of lib.vocab) add(x.da, { kind: 'vocab', chapter_id: x.chapter_id, id: x.id });
  // This is Danish text in the app, outside the structured chapter library.
  add('Du gjorde det!', { kind: 'finish' });
  add('Hej!', { kind: 'home' });
  return [...byText.values()];
}

let lastRequest = 0;
async function pace() {
  const wait = lastRequest + minIntervalMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now(); // count failed attempts too
}

async function synthesize(item, key, region) {
  const xml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="da-DK"><voice name="${voice}">${escapeXml(item.text)}</voice></speak>`;
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  for (let attempt = 0; attempt < 8; attempt++) {
    await pace();
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': format,
          'User-Agent': 'danish-book-anna-audio-generator',
        },
        body: xml,
        signal: AbortSignal.timeout(30000),
      });
    } catch (e) {
      if (attempt === 7) throw new Error(`Network error after 8 attempts: ${e.message}`);
      await sleep(Math.min(60000, 2000 * 2 ** attempt));
      continue;
    }
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 128 || bytes.toString('ascii', 0, 3) !== 'ID3' && (bytes[0] !== 0xff || (bytes[1] & 0xe0) !== 0xe0)) {
        throw new Error(`Invalid MP3 returned for ${item.file}`);
      }
      return bytes;
    }
    if (![408, 429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Azure HTTP ${response.status} for ${item.file}; check key, region, voice, and quota`);
    }
    if (attempt === 7) throw new Error(`Azure HTTP ${response.status} after 8 attempts for ${item.file}`);
    const retryAfter = Number(response.headers.get('retry-after'));
    await sleep(Math.min(120000, Math.max(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0, 2000 * 2 ** attempt)));
  }
}

async function main() {
  const entries = catalog(library());
  const chars = entries.reduce((n, x) => n + x.text.length, 0);
  const missing = entries.filter((x) => !existsSync(join(root, x.file)) || statSync(join(root, x.file)).size < 128);
  console.log(`${entries.length} unique Danish recordings; ${chars} characters; ${missing.length} files to create; ~${Math.ceil(missing.length * minIntervalMs / 60000)} minutes minimum.`);
  if (inventoryOnly) return;
  const sample = sampleOnly ? entries.find((x) => x.sources.some((s) => s.kind === 'phrase')) : null;
  const pending = sample ? missing.filter((x) => x.file === sample.file) : missing;
  if (sample) console.log(`Sample sentence: ${sample.text}`);
  loadEnv(envIndex >= 0 ? args[envIndex + 1] : undefined);
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region || !/^[a-z0-9-]+$/.test(region)) throw new Error('Supply AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, or pass --env path/to/secrets.env');
  if (process.env.AZURE_SPEECH_VOICE && process.env.AZURE_SPEECH_VOICE !== voice) console.log(`Using requested voice ${voice} (overrides AZURE_SPEECH_VOICE).`);
  let created = 0;
  for (const item of pending.slice(0, maxNew)) {
    const target = join(root, item.file);
    mkdirSync(dirname(target), { recursive: true });
    const bytes = await synthesize(item, key, region);
    const temp = `${target}.tmp-${process.pid}`;
    try {
      writeFileSync(temp, bytes);
      renameSync(temp, target);
    } finally {
      rmSync(temp, { force: true });
    }
    created++;
    if (created === 1 || created % 20 === 0 || created === pending.length) console.log(`Generated ${created}/${Math.min(pending.length, maxNew)} selected; remaining in book ${missing.length - created}. Last: ${item.file}`);
  }
  if (created < missing.length) {
    console.log('Partial run: resume with the same command. Manifest will be written when all files exist.');
    return;
  }
  mkdirSync(output, { recursive: true });
  const manifest = { voice, format, entries };
  const target = join(output, 'manifest.json');
  const temp = `${target}.tmp-${process.pid}`;
  writeFileSync(temp, JSON.stringify(manifest, null, 2) + '\n');
  renameSync(temp, target);
  console.log(`Complete: ${entries.length} recordings indexed in audio/manifest.json`);
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });
