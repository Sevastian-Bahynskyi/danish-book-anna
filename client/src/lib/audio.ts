import * as Crypto from 'expo-crypto';
import { createAudioPlayer } from 'expo-audio';

import { supabase } from './supabase';

const VOICE = 'da-DK-JeppeNeural';
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
let player: ReturnType<typeof createAudioPlayer> | null = null;
let currentUrl: string | null = null;

export function stopDanishAudio(): void {
  player?.remove();
  player = null;
  currentUrl = null;
}

export async function playDanishAudio(text: string): Promise<void> {
  const normalized = text.normalize('NFC').replace(/\s+/g, ' ').trim();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify([VOICE, FORMAT, normalized]),
  );
  const path = `da/${hash.slice(0, 24)}.mp3`;
  const { data } = supabase.storage.from('audio').getPublicUrl(path);

  if (currentUrl === data.publicUrl && player) {
    player.seekTo(0);
    player.play();
    return;
  }

  player?.remove();
  currentUrl = data.publicUrl;
  const next = createAudioPlayer(data.publicUrl, { downloadFirst: true });
  player = next;
  // Resolve once sound actually starts, so the button can show a spinner while
  // the recording downloads. Give up waiting after 8 s rather than spin forever.
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(done, 8000);
    const sub = next.addListener('playbackStatusUpdate', (status) => {
      if (status.playing) done();
    });
    function done(): void {
      clearTimeout(timeout);
      sub.remove();
      resolve();
    }
    next.play();
  });
}
