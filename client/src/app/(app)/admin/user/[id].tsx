import * as Clipboard from 'expo-clipboard';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, CheckIcon, CheckCircleIcon, CopyIcon, KeyIcon, LockIcon, LockOpenIcon, SignOutIcon, TrashIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { Banner, Body, Button, H1, H3, Loading, Muted, Surface } from '@/components/ui';
import { device, timeAgo, useAdminAction, useUserDetail } from '@/lib/admin';
import { useProfile } from '@/lib/auth';
import { useLibrary } from '@/lib/content';
import { formatPhone } from '@/lib/phone';
import { fonts, space, useTheme } from '@/theme';

// Destructive actions ask once more inline, with a clear way back.
function Confirm({ label, question, danger, icon, onConfirm, busy }: { label: string; question: string; danger?: boolean; icon: typeof TrashIcon; onConfirm: () => void; busy?: boolean }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <Button icon={icon} label={label} variant={danger ? 'danger' : 'secondary'} onPress={() => setAsking(true)} />;
  return (
    <Surface tone="soft" style={{ gap: space(2), padding: space(4) }}>
      <Body style={{ fontFamily: fonts.bold }}>{question}</Body>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button icon={icon} label={`Так, ${label.toLowerCase()}`} variant={danger ? 'danger' : 'primary'} loading={busy} onPress={onConfirm} />
        <Button label="Скасувати" variant="ghost" onPress={() => setAsking(false)} />
      </View>
    </Surface>
  );
}

export default function AdminUser() {
  const { c } = useTheme();
  const id = useLocalSearchParams<{ id: string }>().id;
  const me = useProfile();
  const detail = useUserDetail(id);
  const lib = useLibrary();
  const act = useAdminAction();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (detail.isLoading) return <Loading />;
  const d = detail.data;
  if (!d?.profile) {
    return (
      <Screen>
        <Section style={{ paddingTop: space(8) }}>
          <Banner tone="warn" icon={WarningCircleIcon}>Користувача не знайдено. Можливо, його вже видалили.</Banner>
          <Link href="/admin" asChild>
            <Button icon={ArrowLeftIcon} label="До адмін-панелі" />
          </Link>
        </Section>
      </Screen>
    );
  }
  const p = d.profile;
  const self = p.id === me?.id;
  const run = async (fn: string, message: string) => {
    await act.mutateAsync({ fn, args: fn === 'admin_set_status' ? { uid: p.id, new_status: p.status === 'blocked' ? 'active' : 'blocked' } : { uid: p.id } });
    setDone(message);
  };
  const message = code
    ? `Привіт! Ось твій код для нового пароля: ${code}\n\nВідкрий сайт, натисни «Новий пароль», введи свій номер телефону, цей код і новий пароль. Код діє 48 годин.`
    : '';

  return (
    <Screen>
      <Section style={{ paddingTop: space(6) }}>
        <Link href="/admin" asChild>
          <Button variant="ghost" icon={ArrowLeftIcon} label="Усі користувачі" style={{ paddingHorizontal: 0 }} />
        </Link>
        <H1 style={{ fontSize: 32 }}>{p.display_name || formatPhone(p.phone)}</H1>
        <Muted>
          {formatPhone(p.phone)} · {p.role === 'admin' ? 'адміністратор' : p.status === 'blocked' ? 'заблоковано' : 'активний доступ'}
        </Muted>
        {done ? <Banner tone="ok" icon={CheckCircleIcon}>{done}</Banner> : null}
      </Section>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(4) }}>
        <Surface style={{ flexGrow: 1, flexBasis: 320, gap: space(2) }}>
          <H3>Активність</H3>
          <Body>Зареєструвалася: {new Date(p.created_at).toLocaleDateString('uk-UA')}</Body>
          <Body>Востаннє заходила: {timeAgo(p.last_seen_at ?? p.last_login_at)}</Body>
          <Body>Останній вхід: {timeAgo(p.last_login_at)}</Body>
          <Body>Зараз: {p.online ? 'має активну сесію' : 'не в системі'}</Body>
          <Body>Збережено: {d.saved}</Body>
          <Body>Пройдено розділів: {d.progress.filter((x) => x.completed_at).length} / {lib.data?.chapters.length ?? 14}</Body>
          {d.logins.length ? (
            <View style={{ marginTop: space(2), gap: 4 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.ink }}>Останні входи</Text>
              {d.logins.map((l, i) => (
                <Muted key={i} style={{ fontSize: 14 }}>
                  {new Date(l.at).toLocaleString('uk-UA')} · {device(l.user_agent)}
                </Muted>
              ))}
            </View>
          ) : null}
        </Surface>

        <Surface style={{ flexGrow: 1, flexBasis: 320, gap: space(2) }}>
          <H3>Розділи</H3>
          {lib.data?.chapters.map((ch) => {
            const pr = d.progress.find((x) => x.chapter_id === ch.id);
            return (
              <View key={ch.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {pr?.completed_at ? <CheckIcon size={16} color={c.ok} weight="bold" /> : <View style={{ width: 16 }} />}
                <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: pr ? c.ink : c.muted }}>
                  {ch.id}. {ch.title_da}
                </Text>
                <Muted style={{ fontSize: 13 }}>{pr?.completed_at ? 'пройдено' : pr ? 'відкрито' : ''}</Muted>
              </View>
            );
          })}
        </Surface>
      </View>

      <Section>
        <H3>Дії</H3>
        {self ? <Muted>Це ваш акаунт. Блокувати чи видаляти себе не можна.</Muted> : null}

        <Surface style={{ gap: space(3) }}>
          <Body style={{ fontFamily: fonts.bold }}>Скинути пароль</Body>
          <Muted style={{ fontSize: 15 }}>Створіть код і надішліть його людині в Messenger. Код діє 48 годин.{d.reset_pending && !code ? ' Зараз уже є діючий код; новий замінить його.' : ''}</Muted>
          {code ? (
            <View style={{ gap: space(3) }}>
              <Text selectable style={{ fontFamily: fonts.heavy, fontSize: 36, letterSpacing: 6, color: c.accentInk }}>
                {code}
              </Text>
              <View style={{ backgroundColor: c.surface2, borderRadius: 14, padding: space(3) }}>
                <Body selectable style={{ fontSize: 15 }}>{message}</Body>
              </View>
              <Button
                icon={copied ? CheckIcon : CopyIcon}
                label={copied ? 'Скопійовано' : 'Скопіювати повідомлення'}
                onPress={async () => {
                  await Clipboard.setStringAsync(message);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
              />
            </View>
          ) : (
            <Button
              icon={KeyIcon}
              label="Створити код"
              variant="primary"
              loading={act.isPending}
              onPress={async () => setCode((await act.mutateAsync({ fn: 'admin_create_reset_code', args: { uid: p.id } })) as string)}
            />
          )}
        </Surface>

        {!self ? (
          <Surface style={{ gap: space(3) }}>
            <Body style={{ fontFamily: fonts.bold }}>Доступ</Body>
            <Confirm
              icon={SignOutIcon}
              label="Завершити сесію"
              question="Людину буде виведено з сайту на всіх пристроях. Вона зможе знову увійти зі своїм паролем."
              busy={act.isPending}
              onConfirm={() => run('admin_end_session', 'Сесію завершено.')}
            />
            <Confirm
              icon={p.status === 'blocked' ? LockOpenIcon : LockIcon}
              label={p.status === 'blocked' ? 'Розблокувати' : 'Заблокувати'}
              question={p.status === 'blocked' ? 'Людина знову зможе входити і читати матеріал.' : 'Людина не зможе входити, поки ви її не розблокуєте. Її збережені фрази залишаться.'}
              busy={act.isPending}
              onConfirm={() => run('admin_set_status', p.status === 'blocked' ? 'Доступ відновлено.' : 'Акаунт заблоковано.')}
            />
            <Confirm
              icon={TrashIcon}
              danger
              label="Видалити"
              question="Акаунт, прогрес і збережені фрази буде видалено назавжди, а номер прибрано зі списку доступу. Це не можна скасувати."
              busy={act.isPending}
              onConfirm={async () => {
                await act.mutateAsync({ fn: 'admin_delete_user', args: { uid: p.id } });
                router.replace('/admin');
              }}
            />
          </Surface>
        ) : null}
      </Section>
    </Screen>
  );
}
