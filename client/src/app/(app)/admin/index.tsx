import { Link } from 'expo-router';
import { CaretRightIcon, CircleIcon, ClockIcon, PlusIcon, ShieldCheckIcon, TrashIcon, UserCircleIcon, UsersIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Text, TextInput, View, useWindowDimensions } from 'react-native';

import { Screen, Section } from '@/components/Screen';
import { Banner, Button, Empty, Field, H1, H2, H3, Loading, Muted, Surface } from '@/components/ui';
import { useChapterTotal } from '@/lib/content';
import { timeAgo, useAdminAction, useAdminUsers, useAllowedPhones, useStats, type AdminUser } from '@/lib/admin';
import { formatPhone } from '@/lib/phone';
import { fonts, radius, space, useTheme } from '@/theme';
import { Tap } from '@/components/Tap';

function Stat({ label, value }: { label: string; value: number | string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexGrow: 1, flexBasis: 150, backgroundColor: c.surface, borderRadius: radius.inner, borderWidth: 1, borderColor: c.line, padding: space(4) }}>
      <Text style={{ fontFamily: fonts.heavy, fontSize: 30, color: c.accentInk }}>{value}</Text>
      <Muted style={{ fontSize: 14, lineHeight: 19 }}>{label}</Muted>
    </View>
  );
}

function AddPhone() {
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const act = useAdminAction();
  const add = async () => {
    setMsg(null);
    try {
      const added = (await act.mutateAsync({ fn: 'admin_add_phone', args: { raw_phone: phone, note } })) as string;
      setMsg({ ok: true, text: `Номер ${formatPhone(added)} додано. Людина вже може зареєструватися.` });
      setPhone('');
      setNote('');
    } catch (e) {
      setMsg({ ok: false, text: /bad_phone/.test(String(e)) ? 'Перевірте номер. Данський можна без +45, інші з кодом країни (+380…).' : 'Не вдалося додати номер. Спробуйте ще раз.' });
    }
  };
  return (
    <Surface style={{ gap: space(2) }}>
      <H3>Відкрити доступ</H3>
      <Muted style={{ fontSize: 15 }}>Після оплати додайте номер покупця. Потім людина реєструється на сайті з цим номером і своїм паролем.</Muted>
      <Field label="Номер телефону" value={phone} onChangeText={setPhone} keyboardType="phone-pad" inputMode="tel" placeholder="12 34 56 78" />
      <Field label="Нотатка (необов'язково)" hint="Наприклад, ім'я з Messenger" value={note} onChangeText={setNote} />
      {msg ? <Banner tone={msg.ok ? 'ok' : 'warn'}>{msg.text}</Banner> : null}
      <Button variant="primary" icon={PlusIcon} label="Додати номер" loading={act.isPending} disabled={!phone.trim()} onPress={add} />
    </Surface>
  );
}

function Waiting() {
  const { c } = useTheme();
  const phones = useAllowedPhones();
  const act = useAdminAction();
  const waiting = phones.data?.filter((p) => !p.registered) ?? [];
  return (
    <Surface style={{ gap: space(2) }}>
      <H3>Чекають на реєстрацію</H3>
      {phones.isLoading ? (
        <Loading />
      ) : waiting.length === 0 ? (
        <Muted style={{ fontSize: 15 }}>Усі додані номери вже зареєструвалися.</Muted>
      ) : (
        waiting.map((p) => (
          <View key={p.phone} style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(2), borderTopWidth: 1, borderTopColor: c.line }}>
            <ClockIcon size={20} color={c.muted} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.ink }}>{formatPhone(p.phone)}</Text>
              <Muted style={{ fontSize: 14 }}>{[p.note, `додано ${timeAgo(p.added_at)}`].filter(Boolean).join(' · ')}</Muted>
            </View>
            <Button variant="ghost" icon={TrashIcon} label="Прибрати" onPress={() => act.mutate({ fn: 'admin_remove_phone', args: { phone: p.phone } })} />
          </View>
        ))
      )}
    </Surface>
  );
}

function UserRow({ u }: { u: AdminUser }) {
  const { c } = useTheme();
  const total = useChapterTotal();
  return (
    <Link href={{ pathname: '/admin/user/[id]', params: { id: u.id } }} asChild>
      <Tap role="link" pressStyle={({ hovered }) => ({ flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3), paddingHorizontal: space(4), backgroundColor: hovered ? c.surface2 : c.surface, borderTopWidth: 1, borderTopColor: c.line })}>
        {u.role === 'admin' ? <ShieldCheckIcon size={24} color={c.accentInk} weight="fill" /> : <UserCircleIcon size={24} color={u.status === 'blocked' ? c.bad : c.muted} weight="fill" />}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.ink }}>
            {u.display_name ? `${u.display_name} · ` : ''}
            {formatPhone(u.phone)}
          </Text>
          <Muted style={{ fontSize: 14 }}>
            {u.status === 'blocked' ? 'Заблоковано · ' : ''}Востаннє заходила: {timeAgo(u.last_seen_at ?? u.last_login_at)} · {u.chapters_done}/{total} розділів
          </Muted>
        </View>
        {u.online && u.status === 'active' ? <CircleIcon size={10} color={c.ok} weight="fill" aria-label="Має активну сесію" /> : null}
        <CaretRightIcon size={18} color={c.muted} />
      </Tap>
    </Link>
  );
}

export default function Admin() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const stats = useStats();
  const users = useAdminUsers();
  const [filter, setFilter] = useState('');
  const list = (users.data ?? []).filter((u) => !filter.trim() || `${u.phone} ${u.display_name ?? ''}`.toLowerCase().includes(filter.trim().toLowerCase().replace(/\s/g, '')) || (u.display_name ?? '').toLowerCase().includes(filter.trim().toLowerCase()));
  const s = stats.data;
  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <H1>Адмін-панель</H1>
        <Muted>Доступи, користувачі і статистика.</Muted>
      </Section>
      <Section>
        {s ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(3) }}>
            <Stat label="користувачів" value={s.users} />
            <Stat label="активні за 7 днів" value={s.active_7d} />
            <Stat label="входів за 30 днів" value={s.logins_30d} />
            <Stat label="чекають на реєстрацію" value={s.waiting} />
            <Stat label="пройшли все" value={s.finished_all} />
            <Stat label="збережених фраз" value={s.saved_total} />
          </View>
        ) : (
          <Loading />
        )}
      </Section>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: space(4), alignItems: 'flex-start' }}>
        <View style={{ flexGrow: 1, flexBasis: wide ? 0 : 'auto', alignSelf: 'stretch' }}>
          <AddPhone />
        </View>
        <View style={{ flexGrow: 1, flexBasis: wide ? 0 : 'auto', alignSelf: 'stretch' }}>
          <Waiting />
        </View>
      </View>
      <Section>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <UsersIcon size={26} color={c.accentInk} />
          <H2>Користувачі</H2>
        </View>
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Пошук за номером або ім'ям"
          placeholderTextColor={c.muted}
          accessibilityLabel="Пошук користувача"
          style={{ minHeight: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, paddingHorizontal: space(4), fontFamily: fonts.semibold, fontSize: 16, color: c.ink }}
        />
        {users.isLoading ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty icon={UsersIcon} title="Нікого не знайдено" />
        ) : (
          <View style={{ borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: c.line, marginTop: -1 }}>
            {list.map((u) => (
              <UserRow key={u.id} u={u} />
            ))}
          </View>
        )}
      </Section>
      {s ? (
        <Section>
          <H2>Розділи</H2>
          <Surface style={{ gap: 0, paddingVertical: space(2) }}>
            {s.chapters.map((ch) => (
              <View key={ch.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space(3), paddingVertical: space(2), borderTopWidth: ch.id === 1 ? 0 : 1, borderTopColor: c.line }}>
                <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: c.ink }}>
                  {ch.id}. {ch.title_da}
                </Text>
                <Muted style={{ fontSize: 14 }}>
                  відкрили {ch.visited} · пройшли {ch.completed}
                </Muted>
              </View>
            ))}
          </Surface>
        </Section>
      ) : null}
    </Screen>
  );
}
