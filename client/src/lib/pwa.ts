import { useEffect, useState, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

// Installing the website as an app (PWA): which phone and browser the reader
// has, the browser's own install prompt where it exists (Android, desktop
// Chrome/Edge), and whether the guide should open by itself.

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
declare global {
  interface Window {
    // Captured by the inline script in public/index.html, which runs before the app loads.
    __dpaInstall?: InstallEvent | null;
  }
}

const web = Platform.OS === 'web' && typeof window !== 'undefined';
const APP_PATH = '/danish-book-anna/';
const SHOWN_KEY = 'dpa.install.shown';
const INSTALLED_KEY = 'dpa.install.done';

export type Os = 'ios' | 'android' | 'desktop';
export type Browser = 'safari' | 'chrome' | 'samsung' | 'other' | 'inapp';
export type Device = { os: Os; browser: Browser; ipad: boolean; safariVersion: number; label: string };

export function detectDevice(): Device {
  const ua = web ? navigator.userAgent : '';
  const ipad = web && (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const ios = ipad || /iPhone|iPod/.test(ua);
  const android = /Android/.test(ua);
  // Messenger, Facebook, Instagram and similar apps open links in their own
  // browser, which cannot install anything.
  const inapp = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|Line\/|Snapchat|TikTok|musical_ly|LinkedInApp|GSA\/|; wv\)/.test(ua);
  const safariVersion = Number(ua.match(/Version\/(\d+)/)?.[1] ?? 0);
  let browser: Browser;
  if (inapp) browser = 'inapp';
  else if (ios) browser = /CriOS/.test(ua) ? 'chrome' : /FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua) ? 'other' : /Safari/.test(ua) ? 'safari' : 'inapp';
  else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/Firefox|EdgA|OPR|YaBrowser|MiuiBrowser|HuaweiBrowser/.test(ua)) browser = 'other';
  else if (/Chrome/.test(ua)) browser = 'chrome';
  else browser = 'other';
  const os: Os = ios ? 'ios' : android ? 'android' : 'desktop';
  const phone = os === 'ios' ? (ipad ? 'iPad' : 'iPhone') : os === 'android' ? 'Android' : "комп'ютер";
  const name = { safari: 'Safari', chrome: 'Chrome', samsung: 'Samsung Internet', other: 'інший браузер', inapp: 'браузер усередині застосунку' }[browser];
  return { os, browser, ipad, safariVersion, label: `${phone}, ${name}` };
}

// Opened from the home-screen icon.
export function isStandalone() {
  if (!web) return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const read = (k: string) => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {}
};

// ---------------------------------------------------------------- the browser's install prompt
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
if (web) {
  window.addEventListener('dpa-install', notify);
  window.addEventListener('appinstalled', () => {
    write(INSTALLED_KEY, '1');
    window.__dpaInstall = null;
    notify();
  });
}
export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** True when one tap can install the app (the browser offers its own dialog). */
export function useCanPrompt() {
  return useSyncExternalStore(subscribe, () => (web ? !!window.__dpaInstall : false), () => false);
}

/** Shows the browser's install dialog. Resolves true when the reader accepted. */
export async function promptInstall() {
  const e = web ? window.__dpaInstall : null;
  if (!e) return false;
  await e.prompt();
  const { outcome } = await e.userChoice;
  // A prompt can be used only once. Chrome sends a new one later if needed.
  window.__dpaInstall = null;
  if (outcome === 'accepted') write(INSTALLED_KEY, '1');
  notify();
  return outcome === 'accepted';
}

/** Android Chrome can tell whether this app is already on the phone. */
async function installedElsewhere() {
  const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
  try {
    return ((await nav.getInstalledRelatedApps?.()) ?? []).length > 0;
  } catch {
    return false;
  }
}

export function useInstalledElsewhere() {
  const [yes, setYes] = useState(false);
  useEffect(() => {
    if (web) installedElsewhere().then(setYes);
  }, []);
  return yes;
}

// ---------------------------------------------------------------- opening the site in a browser that can install
const appUrl = () => (web ? window.location.origin + APP_PATH : '');
export const appAddress = () => appUrl().replace(/^https?:\/\//, '').replace(/\/$/, '');

/** Android: opens the site in Chrome, from Messenger, Facebook or another browser. */
export function openInChrome() {
  const u = new URL(appUrl());
  window.location.href = `intent://${u.host}${u.pathname}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`;
}

/** iPhone: opens the site in Safari (iOS 17 and newer), from Messenger or another browser. */
export function openInSafari() {
  window.location.href = 'x-safari-' + appUrl();
}

export async function copyAddress() {
  try {
    await navigator.clipboard.writeText(appUrl());
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- the guide
let open = false;
const guideListeners = new Set<() => void>();
const setOpen = (v: boolean) => {
  open = v;
  guideListeners.forEach((l) => l());
};
export const openInstallGuide = () => setOpen(true);
export const closeInstallGuide = () => setOpen(false);
export function useInstallGuideOpen() {
  return useSyncExternalStore(
    (l) => {
      guideListeners.add(l);
      return () => guideListeners.delete(l);
    },
    () => open,
    () => false,
  );
}

/** Whether installing makes sense here at all (a browser tab, not the app itself). */
export const canInstallHere = () => web && !isStandalone();

/** Opens the guide once per device, the first time a phone reader enters the book. */
export async function autoOpenInstallGuide() {
  if (!canInstallHere() || read(SHOWN_KEY) || read(INSTALLED_KEY)) return;
  const { os } = detectDevice();
  if (os === 'desktop') return;
  if (await installedElsewhere()) return;
  write(SHOWN_KEY, '1');
  openInstallGuide();
}
