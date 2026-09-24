import { InfoIcon, LockKeyIcon, SignInIcon, UserPlusIcon, WarningCircleIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SilkBackground } from '@/components/effects/SilkBackground';
import { Banner, Body, Button, Field, H1, Hand, Muted } from '@/components/ui';
import { AuthError, useAuth } from '@/lib/auth';
import { fonts, radius, space, useTheme } from '@/theme';

type Mode = 'signin' | 'register' | 'reset';

const NOTICES = {
  replaced: 'Ви увійшли на іншому пристрої, тому тут сесію завершено. Увійдіть ще раз, щоб продовжити тут.',
  blocked: 'Доступ до цього акаунта закрито. Якщо це помилка, напишіть Анні.',
  'password-changed': 'Пароль змінено. Увійдіть з новим паролем.',
} as const;

export default function Login() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, signIn, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const notice = state.status === 'signedOut' ? state.notice : null;

  async function submit() {
    setError(null);
    if (mode !== 'signin' && password !== password2) return setError('Паролі не збігаються.');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(phone, password);
      else if (mode === 'register') await register(phone, password, name);
      else await resetPassword(phone, code, password);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: 'signin', label: 'Вхід' },
    { id: 'register', label: 'Реєстрація' },
    { id: 'reset', label: 'Новий пароль' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SilkBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space(4), paddingTop: insets.top + space(8), paddingBottom: insets.bottom + space(8) }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center', gap: space(5) }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: fonts.heavy, fontSize: 15, letterSpacing: 1.5, color: c.ink }}>DANSK PÅ ARBEJDE</Text>
              <H1 style={{ fontSize: 30, lineHeight: 36 }}>Практична данська для роботи</H1>
              <Hand style={{ fontSize: 22 }}>Created by Anna Melnykova</Hand>
            </View>

            <View style={{ backgroundColor: c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: c.line, padding: space(5), gap: space(4), boxShadow: `0 30px 60px -30px ${c.shadow}` }}>
              <View role="tablist" style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: radius.pill, padding: 4 }}>
                {tabs.map((t) => (
                  <Pressable
                    key={t.id}
                    role="tab"
                    aria-selected={mode === t.id}
                    onPress={() => {
                      setMode(t.id);
                      setError(null);
                    }}
                    style={{ flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === t.id ? c.surface : 'transparent' }}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: mode === t.id ? c.accentInk : c.muted }}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>

              {notice && mode === 'signin' ? <Banner icon={notice === 'blocked' ? WarningCircleIcon : InfoIcon} tone={notice === 'blocked' ? 'warn' : 'info'}>{NOTICES[notice]}</Banner> : null}
              {mode === 'register' ? (
                <Muted style={{ fontSize: 15, lineHeight: 22 }}>Реєстрація працює для номера, який ви надіслали Анні після покупки.</Muted>
              ) : null}
              {mode === 'reset' ? (
                <Muted style={{ fontSize: 15, lineHeight: 22 }}>Забули пароль? Напишіть Анні в Messenger. Вона надішле 6-значний код, з яким ви створите новий пароль.</Muted>
              ) : null}

              <View>
                <Field
                  label="Номер телефону"
                  hint="Данський номер можна без +45"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  inputMode="tel"
                />
                {mode === 'register' ? <Field label="Як до вас звертатися?" hint="Необов'язково" value={name} onChangeText={setName} autoComplete="name" /> : null}
                {mode === 'reset' ? (
                  <Field label="Код від Анни" value={code} onChangeText={setCode} keyboardType="number-pad" inputMode="numeric" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} />
                ) : null}
                <Field
                  label={mode === 'reset' ? 'Новий пароль' : 'Пароль'}
                  hint={mode === 'signin' ? undefined : 'Щонайменше 8 символів'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  textContentType={mode === 'signin' ? 'password' : 'newPassword'}
                  onSubmitEditing={mode === 'signin' ? submit : undefined}
                />
                {mode !== 'signin' ? (
                  <Field label="Повторіть пароль" value={password2} onChangeText={setPassword2} secureTextEntry autoComplete="new-password" onSubmitEditing={submit} />
                ) : null}
              </View>

              {error ? <Banner tone="warn" icon={WarningCircleIcon}>{error}</Banner> : null}

              <Button
                full
                variant="primary"
                loading={busy}
                icon={mode === 'signin' ? SignInIcon : mode === 'register' ? UserPlusIcon : LockKeyIcon}
                label={mode === 'signin' ? 'Увійти' : mode === 'register' ? 'Зареєструватися' : 'Зберегти новий пароль'}
                onPress={submit}
              />
              {mode === 'signin' ? (
                <Body style={{ fontSize: 15, textAlign: 'center', color: c.muted }}>
                  Одночасно можна бути на одному пристрої. Вхід на новому завершить попередню сесію.
                </Body>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
