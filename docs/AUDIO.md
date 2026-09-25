# Danish audio generation

The audio source is the same `supabase/content/source.txt` and
`supabase/content/extras.mjs` content that builds the book. This generator
does not connect to, change, or deploy a database. It includes chapter names,
all 305 phrases, each dialogue line, both displayed mistake examples,
ready-made messages and their individual lines, all exercise options, every
vocabulary entry, and the two short Danish phrases on the home/finish pages.
Repeated identical text uses one recording, with all occurrences listed in
`audio/manifest.json`.

Requirements: Node 20+ and an Azure Speech resource. The intended voice is
`da-DK-JeppeNeural`, regardless of any `AZURE_SPEECH_VOICE` entry in the
provided environment file. The output is 24 kHz, 48 kbps MP3. The GitHub
workflow lets you choose 10%, 15%, 20%, or 30% slower speech, with 15% as
its default. For local generation, set `AZURE_SPEECH_RATE=-15%` or omit it
for Jeppe's normal pace.

```bash
node scripts/generate-audio.mjs --inventory
node scripts/generate-audio.mjs --env /absolute/path/to/secrets.env --sample
node scripts/generate-audio.mjs --env /absolute/path/to/secrets.env
```

Alternatively export `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` and
omit `--env`. Keep the secrets file **outside this repository**. Commit
`audio/da/*.mp3` and `audio/manifest.json` after generation. The manifest is
written only when the full current inventory exists. An interrupted run
keeps completed MP3 files, skips them on rerun, and retries transient errors.
Changed text creates a new filename; review and remove obsolete MP3 files
after content edits.

Azure Speech F0 allows 20 synthesis requests per 60 seconds. This script
starts at most one request every 3.5 seconds (about 17/minute), including
retries, and obeys `Retry-After` with exponential backoff on 429/5xx.
Avoid running multiple generator processes or other clients against the same
F0 resource simultaneously. The inventory command estimates duration and
unique input characters without using credentials or requesting audio.

The output folder is deliberately `audio/`, **not** `client/public/`.
GitHub Pages is public even when the repository is private. Publishing MP3s
as static assets would make them directly accessible without signing in.
Playback and protected delivery can be designed separately.

## Run on GitHub, without a local computer

1. In the repository, open **Settings → Secrets and variables → Actions →
   New repository secret**. Add `AZURE_SPEECH_KEY` using the key from your
   private `secrets.env`. The region is already configured as `northeurope`
   in the workflow. Do not paste the key into a workflow input.
2. Open **Actions → Generate Danish audio → Run workflow**. Choose the
   `feat/azure-jeppe-audio-generator` branch, the `sample` mode, and a
   speaking-speed setting.
   The job commits the first book sentence as one MP3 on that branch.
3. Listen to that file in `audio/da/`. Then rerun the same workflow with
   mode `all` and **the same speaking speed**. It skips the sample,
   generates the remaining recordings,
   and commits the full `audio/manifest.json` index.

Speed is included in each MP3's content hash and in the manifest. A later
change to speed creates new files, leaving any old-speed MP3s for you to
remove after reviewing the new recordings.

The workflow is registered on the repository's current default branch so
GitHub displays its Run workflow button. It can only generate audio when
the feature branch is selected. Each run commits completed MP3s even if a
later request fails; rerunning continues from existing files.
