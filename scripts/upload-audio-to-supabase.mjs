import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const audioRoot = join(root, 'audio', 'da');
const manifest = JSON.parse(await readFile(join(root, 'audio', 'manifest.json'), 'utf8'));
const state = JSON.parse(await readFile(join(root, 'audio', 'state.json'), 'utf8'));
const envPath = join(root, 'client', '.env');
const envText = await readFile(envPath, 'utf8');
const url = envText.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
// Locally the key can live in the gitignored secrets.env; CI passes it as an environment variable.
const secrets = await readFile(join(root, 'secrets.env'), 'utf8').catch(() => '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  secrets.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?([^'"\s]+)['"]?\s*$/m)?.[1];

if (!url || !url.includes('yojtljapcpcpqddukzxg.supabase.co')) {
  throw new Error('The configured Supabase URL does not match the expected project.');
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.isFile() && entry.name.endsWith('.mp3')) files.push(path);
  }
  return files;
}

const files = await walk(audioRoot);
const expected = new Set(manifest.entries.map((entry) => entry.file));
if (files.length === 0 || files.length !== expected.size || expected.size !== Object.keys(state.files).length) {
  throw new Error('The MP3 count does not match audio/manifest.json and audio/state.json.');
}
for (const file of files) {
  const path = relative(root, file).split('\\').join('/');
  const recorded = state.files[path];
  if (!expected.has(path) || recorded?.rate !== manifest.rate) {
    throw new Error(`Unexpected or out-of-date audio file: ${path}.`);
  }
  const digest = createHash('sha256').update(await readFile(file)).digest('hex');
  if (digest !== recorded.sha256) throw new Error(`Audio checksum mismatch: ${path}.`);
}
console.log(`Verified ${files.length} audio files against manifest and state.`);
if (process.argv.includes('--verify-only')) process.exit(0);
if (!key) throw new Error('Set SUPABASE_SERVICE_ROLE_KEY in the environment before uploading.');

const upload = async (file) => {
  const objectPath = relative(join(root, 'audio'), file).split('\\').join('/');
  const response = await fetch(`${url}/storage/v1/object/audio/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: await readFile(file),
  });
  if (!response.ok) throw new Error(`Upload failed with HTTP ${response.status} for ${objectPath}.`);
};

let completed = 0;
const queue = [...files];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length > 0) {
    const file = queue.shift();
    if (!file) return;
    await upload(file);
    completed++;
    if (completed % 50 === 0 || completed === files.length) {
      process.stdout.write(`Uploaded ${completed}/${files.length} audio files\n`);
    }
  }
});

await Promise.all(workers);
