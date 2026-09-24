import {
  ArrowFatDownIcon,
  ArrowFatUpIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CopyIcon,
  DeviceMobileIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  ExportIcon,
  ListIcon,
  PlusSquareIcon,
  XIcon,
} from 'phosphor-react-native';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  appAddress,
  closeInstallGuide,
  copyAddress,
  detectDevice,
  isStandalone,
  openInChrome,
  openInSafari,
  promptInstall,
  useCanPrompt,
  useInstallGuideOpen,
  useInstalledElsewhere,
  type Device,
} from '@/lib/pwa';
import { fonts, radius, space, useTheme } from '@/theme';
import { Nudge } from './effects/Nudge';
import { Tap } from './Tap';
import { Body, Button, Muted, type Icon } from './ui';

// «Встановити книжку на телефон»: a guide that fits the reader's phone and
// browser. Where the browser allows it (Android, desktop Chrome) one button
// installs the app. On iPhone nothing can install it for the reader, so the
// guide shows the exact buttons to press and points at the first one.

// ---------------------------------------------------------------- pictures of what to press
function Key({ icon: I }: { icon: Icon }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 52, height: 44, borderRadius: 12, borderWidth: 2, borderColor: c.accent, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <I size={26} color={c.accentInk} weight="bold" />
      </View>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.muted }}>ось такий значок</Text>
    </View>
  );
}

function Row({ label, icon: I }: { label: string; icon: Icon }) {
  const { c } = useTheme();
  return (
    <View style={{ minHeight: 48, borderRadius: 12, borderWidth: 2, borderColor: c.accent, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space(3), gap: 10 }}>
      <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 16, color: c.ink }}>{label}</Text>
      <I size={24} color={c.ink} />
    </View>
  );
}

function Bar({ action }: { action: string }) {
  const { c } = useTheme();
  return (
    <View style={{ minHeight: 48, borderRadius: 12, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space(3) }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.muted }}>Скасувати</Text>
      <View style={{ paddingHorizontal: space(3), minHeight: 36, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 2, borderColor: c.accent, backgroundColor: c.accentSoft }}>
        <Text style={{ fontFamily: fonts.heavy, fontSize: 16, color: c.accentInk }}>{action}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- what to show for each phone
type Step = { text: ReactNode; pic?: ReactNode; hint?: string };
type Pointer = { dir: 'up' | 'down'; side: 'center' | 'right' };
type Plan =
  | { kind: 'message'; title: string; text: string; ok?: boolean }
  | { kind: 'prompt'; desktop: boolean }
  | { kind: 'steps'; steps: Step[]; pointer?: Pointer; after: string }
  | { kind: 'switch'; to: 'safari' | 'chrome'; inapp: boolean }
  | { kind: 'desktop' };

const B = ({ children }: { children: ReactNode }) => {
  const { c } = useTheme();
  return <Text style={{ fontFamily: fonts.heavy, color: c.ink }}>{children}</Text>;
};

const HOME_IOS = 'Англійською: Add to Home Screen. Данською: Føj til hjemmeskærm.';
const AFTER_IOS = 'На екрані телефону з’явиться іконка «Dansk». Відкривайте книжку з неї. Першого разу увійдіть ще раз тим самим номером і паролем.';
const AFTER_ANDROID = 'На екрані телефону з’явиться іконка «Dansk». Відкривайте книжку з неї, на весь екран, як звичайний застосунок.';

function iosSteps(d: Device): { steps: Step[]; pointer: Pointer } {
  const add: Step = { text: <>Прокрутіть трохи вниз і натисніть <B>«На Початковий екран»</B>.</>, pic: <Row label="На Початковий екран" icon={PlusSquareIcon} />, hint: HOME_IOS };
  const confirm: Step = { text: <>Угорі праворуч натисніть <B>«Додати»</B>.</>, pic: <Bar action="Додати" /> };
  if (d.browser === 'chrome') {
    return {
      pointer: { dir: 'up', side: 'right' },
      steps: [{ text: <>Угорі праворуч, у рядку з адресою, натисніть <B>«Поширити»</B>.</>, pic: <Key icon={ExportIcon} /> }, add, confirm],
    };
  }
  if (d.ipad) {
    return {
      pointer: { dir: 'up', side: 'right' },
      steps: [{ text: <>Угорі праворуч натисніть <B>«Поширити»</B>.</>, pic: <Key icon={ExportIcon} /> }, add, confirm],
    };
  }
  if (d.safariVersion >= 26) {
    return {
      pointer: { dir: 'down', side: 'right' },
      steps: [
        { text: <>Унизу праворуч натисніть <B>«•••»</B> (три крапки).</>, pic: <Key icon={DotsThreeIcon} />, hint: 'Якщо внизу видно значок «Поширити», натисніть одразу його і переходьте до кроку 3.' },
        { text: <>Виберіть <B>«Поширити»</B>.</>, pic: <Row label="Поширити" icon={ExportIcon} /> },
        add,
        confirm,
      ],
    };
  }
  return {
    pointer: { dir: 'down', side: 'center' },
    steps: [{ text: <>Унизу посередині натисніть <B>«Поширити»</B>.</>, pic: <Key icon={ExportIcon} /> }, add, confirm],
  };
}

function androidSteps(d: Device): { steps: Step[]; pointer: Pointer } {
  if (d.browser === 'samsung') {
    return {
      pointer: { dir: 'down', side: 'right' },
      steps: [
        { text: <>Унизу праворуч натисніть <B>«≡»</B> (три риски).</>, pic: <Key icon={ListIcon} /> },
        { text: <>Виберіть <B>«Додати сторінку до»</B>, потім <B>«Головний екран»</B>.</>, pic: <Row label="Головний екран" icon={DeviceMobileIcon} /> },
        { text: <>Натисніть <B>«Додати»</B>.</>, pic: <Bar action="Додати" /> },
      ],
    };
  }
  return {
    pointer: { dir: 'up', side: 'right' },
    steps: [
      { text: <>Угорі праворуч натисніть <B>«⋮»</B> (три крапки).</>, pic: <Key icon={DotsThreeVerticalIcon} /> },
      {
        text: <>Виберіть <B>«Установити додаток»</B> або <B>«Додати на головний екран»</B>.</>,
        pic: <Row label="Установити додаток" icon={DeviceMobileIcon} />,
        hint: 'Англійською: Install app або Add to Home screen. Данською: Installer app.',
      },
      { text: <>Натисніть <B>«Установити»</B>.</>, pic: <Bar action="Установити" /> },
    ],
  };
}

function makePlan(d: Device, canPrompt: boolean, installed: boolean, done: boolean): Plan {
  if (done) return { kind: 'message', ok: true, title: 'Готово!', text: 'Іконка «Dansk» тепер на екрані. Відкривайте книжку з неї, на весь екран, як звичайний застосунок.' };
  if (isStandalone()) return { kind: 'message', ok: true, title: 'Уже встановлено', text: 'Ви відкрили книжку як застосунок. Нічого робити не треба.' };
  if (canPrompt) return { kind: 'prompt', desktop: d.os === 'desktop' };
  if (installed) return { kind: 'message', ok: true, title: 'Книжка вже на телефоні', text: 'Знайдіть на екрані телефону іконку «Dansk» і відкривайте книжку з неї.' };
  if (d.os === 'desktop') return { kind: 'desktop' };
  if (d.os === 'ios') {
    if (d.browser === 'safari' || d.browser === 'chrome') return { kind: 'steps', ...iosSteps(d), after: AFTER_IOS };
    return { kind: 'switch', to: 'safari', inapp: d.browser === 'inapp' };
  }
  if (d.browser === 'chrome' || d.browser === 'samsung') return { kind: 'steps', ...androidSteps(d), after: AFTER_ANDROID };
  return { kind: 'switch', to: 'chrome', inapp: d.browser === 'inapp' };
}

// ---------------------------------------------------------------- pieces
function Num({ n }: { n: number }) {
  const { c, dark } = useTheme();
  const bg = dark ? c.accent : c.accentInk;
  return (
    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.heavy, fontSize: 16, color: c.onAccent }}>{n}</Text>
    </View>
  );
}

function Steps({ steps, after }: { steps: Step[]; after: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space(5) }}>
      {steps.map((s, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <Num n={i + 1} />
          <View style={{ flex: 1, gap: 10 }}>
            <Body style={{ fontSize: 17, lineHeight: 25 }}>{s.text}</Body>
            {s.pic}
            {s.hint ? <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.muted }}>{s.hint}</Text> : null}
          </View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 12, padding: space(4), borderRadius: radius.inner, backgroundColor: c.infoSoft }}>
        <CheckCircleIcon size={24} color={c.ok} weight="fill" />
        <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: c.ink }}>{after}</Text>
      </View>
    </View>
  );
}

function CopyAddress() {
  const { c } = useTheme();
  const [copied, setCopied] = useState(false);
  return (
    <View style={{ gap: space(2) }}>
      <View style={{ padding: space(3), borderRadius: radius.inner, backgroundColor: c.surface2 }}>
        <Text selectable style={{ fontFamily: fonts.bold, fontSize: 15, color: c.ink }}>
          {appAddress()}
        </Text>
      </View>
      <Button
        label={copied ? 'Адресу скопійовано' : 'Скопіювати адресу'}
        icon={copied ? CheckCircleIcon : CopyIcon}
        onPress={async () => setCopied(await copyAddress())}
        full
      />
    </View>
  );
}

function PointerArrow({ p }: { p: Pointer }) {
  const { c } = useTheme();
  const I = p.dir === 'down' ? ArrowFatDownIcon : ArrowFatUpIcon;
  return (
    <View aria-hidden style={{ alignItems: p.side === 'center' ? 'center' : 'flex-end', paddingHorizontal: space(2), height: 52, justifyContent: 'center' }}>
      <Nudge dir={p.dir}>
        <I size={44} color={c.accent} weight="fill" />
      </Nudge>
    </View>
  );
}

// ---------------------------------------------------------------- the sheet
function Guide() {
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const device = useMemo(() => detectDevice(), []);
  const canPrompt = useCanPrompt();
  const installed = useInstalledElsewhere();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onInstalled = () => setDone(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeInstallGuide();
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const plan = makePlan(device, canPrompt, installed, done);
  const pointer = plan.kind === 'steps' ? plan.pointer : undefined;
  const title = plan.kind === 'message' ? plan.title : plan.kind === 'desktop' || (plan.kind === 'prompt' && plan.desktop) ? 'Книжка як застосунок' : 'Книжка на екрані телефону';

  const install = async () => {
    setBusy(true);
    const ok = await promptInstall();
    setBusy(false);
    if (ok) setDone(true);
  };

  let body: ReactNode;
  let actions: ReactNode = <Button label="Зрозуміло" variant="primary" onPress={closeInstallGuide} full />;
  switch (plan.kind) {
    case 'message':
      body = (
        <View style={{ alignItems: 'center', gap: space(3), paddingVertical: space(2) }}>
          <CheckCircleIcon size={56} color={c.ok} weight="fill" />
          <Body style={{ textAlign: 'center' }}>{plan.text}</Body>
        </View>
      );
      actions = <Button label="Добре" variant="primary" onPress={closeInstallGuide} full />;
      break;
    case 'prompt':
      body = (
        <View style={{ gap: space(3) }}>
          <Body>
            Натисніть <B>«Встановити»</B>, і {plan.desktop ? "на комп'ютері" : 'на екрані телефону'} з’явиться іконка «Dansk». Книжка відкриватиметься з неї на весь екран, як звичайний застосунок.
          </Body>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>У вікні, яке з’явиться, ще раз натисніть «Установити».</Muted>
        </View>
      );
      actions = (
        <View style={{ gap: space(2) }}>
          <Button label="Встановити" icon={DownloadSimpleIcon} variant="primary" onPress={install} loading={busy} full style={{ minHeight: 52 }} />
          <Button label="Пізніше" variant="ghost" onPress={closeInstallGuide} full />
        </View>
      );
      break;
    case 'steps':
      body = (
        <View style={{ gap: space(4) }}>
          <Body>Так книжка відкриватиметься однією кнопкою, на весь екран. Це займе хвилину:</Body>
          <Steps steps={plan.steps} after={plan.after} />
        </View>
      );
      break;
    case 'switch': {
      const safari = plan.to === 'safari';
      body = (
        <View style={{ gap: space(3) }}>
          <Body>
            {plan.inapp ? 'Книжку відкрито всередині іншого застосунку (наприклад, Messenger). Звідси її не встановити.' : 'Цей браузер не вміє ставити книжку на екран.'} Відкрийте її в <B>{safari ? 'Safari' : 'Chrome'}</B>: там це займе хвилину.
          </Body>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>
            Там увійдіть тим самим номером і паролем, і книжка сама покаже, що робити далі.
            {plan.inapp ? ' Якщо кнопка не спрацює, натисніть «•••» у кутку екрана і виберіть «Відкрити в браузері».' : ''}
          </Muted>
          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.ink, marginTop: space(2) }}>Або скопіюйте адресу і вставте її в {safari ? 'Safari' : 'Chrome'}:</Text>
          <CopyAddress />
        </View>
      );
      actions = (
        <View style={{ gap: space(2) }}>
          <Button label={`Відкрити в ${safari ? 'Safari' : 'Chrome'}`} icon={ArrowSquareOutIcon} variant="primary" onPress={safari ? openInSafari : openInChrome} full style={{ minHeight: 52 }} />
          <Button label="Пізніше" variant="ghost" onPress={closeInstallGuide} full />
        </View>
      );
      break;
    }
    case 'desktop':
      body = (
        <View style={{ gap: space(3) }}>
          <Body>Щоб поставити книжку на телефон, відкрийте цю адресу в телефоні й увійдіть. Книжка сама покаже, як це зробити.</Body>
          <CopyAddress />
        </View>
      );
      break;
  }

  return (
    <View
      role="dialog"
      aria-modal
      aria-label={title}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: c.bg + (dark ? 'EB' : 'E6'),
        paddingTop: insets.top + space(2),
        paddingBottom: insets.bottom + space(2),
        paddingHorizontal: space(3),
        justifyContent: pointer?.dir === 'up' ? 'flex-start' : pointer?.dir === 'down' ? 'flex-end' : 'center',
      }}
    >
      {pointer?.dir === 'up' ? <PointerArrow p={pointer} /> : null}
      <View
        style={{
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          flexShrink: 1,
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: c.line,
          boxShadow: `0 24px 48px -24px ${c.shadow}`,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: space(5), paddingRight: space(2), paddingTop: space(4), paddingBottom: space(3) }}>
          <Image source={require('@/assets/images/favicon.png')} style={{ width: 48, height: 48, borderRadius: 12 }} accessibilityIgnoresInvertColors />
          <View style={{ flex: 1 }}>
            <Text role="heading" aria-level={2} style={{ fontFamily: fonts.heavy, fontSize: 21, lineHeight: 26, color: c.ink }}>
              {title}
            </Text>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.muted }}>{device.label}</Text>
          </View>
          <Tap
            accessibilityLabel="Закрити"
            role="button"
            onPress={closeInstallGuide}
            pressStyle={({ hovered }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? c.surface2 : 'transparent' })}
          >
            <XIcon size={22} color={c.muted} />
          </Tap>
        </View>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: space(5), paddingBottom: space(4) }}>
          {body}
        </ScrollView>
        <View style={{ paddingHorizontal: space(5), paddingTop: space(3), paddingBottom: space(5), borderTopWidth: 1, borderTopColor: c.line }}>{actions}</View>
      </View>
      {pointer?.dir === 'down' ? <PointerArrow p={pointer} /> : null}
    </View>
  );
}

export function InstallGuide() {
  const open = useInstallGuideOpen();
  if (!open || Platform.OS !== 'web') return null;
  return <Guide />;
}
