import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { CaretDownIcon, CaretUpIcon, ChatCircleTextIcon, CheckIcon, CheckCircleIcon, CopyIcon, EyeIcon, EyeSlashIcon, HeartIcon, LightbulbIcon, XCircleIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { type Chapter, type Dialogue, type Exercise, type Message, type Mistake, type Phrase, type SavedKind, type Vocab, useIsSaved, useToggleSaved } from '@/lib/content';
import { fonts, radius, space, useTheme } from '@/theme';
import { Spark } from './effects/Spark';
import { Spotlight } from './effects/Spotlight';
import { Body, Button, DaUa, H3, Hand, Muted, Surface } from './ui';
import { Tap } from './Tap';

// ---------------------------------------------------------------- save
export function SaveButton({ kind, id }: { kind: SavedKind; id: number }) {
  const { c } = useTheme();
  const isSaved = useIsSaved();
  const toggle = useToggleSaved();
  const saved = isSaved(kind, id);
  return (
    <Spark color={c.accent}>
      <Button
        label={saved ? 'Збережено' : 'Зберегти'}
        icon={HeartIcon}
        iconWeight={saved ? 'fill' : 'regular'}
        variant={saved ? 'active' : 'secondary'}
        aria-pressed={saved}
        onPress={() => toggle.mutate({ kind, id, saved })}
      />
    </Spark>
  );
}

// ---------------------------------------------------------------- phrase
export function PhraseRow({ phrase, number, first }: { phrase: Phrase; number?: number; first?: boolean }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ paddingVertical: space(4), borderTopWidth: first ? 0 : 1, borderTopColor: c.line, flexDirection: 'row', gap: space(3) }}>
      {number !== undefined && (
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
          <Text style={{ fontFamily: fonts.heavy, fontSize: 13, color: c.accentInk }}>{number}</Text>
        </View>
      )}
      <View style={{ flex: 1, gap: space(3) }}>
        <DaUa da={phrase.da} ua={phrase.ua} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <SaveButton kind="phrase" id={phrase.id} />
          {phrase.explanation_ua ? (
            <Button label="Пояснення" icon={open ? CaretUpIcon : CaretDownIcon} aria-expanded={open} onPress={() => setOpen(!open)} />
          ) : null}
        </View>
        {open && phrase.explanation_ua ? (
          <View style={{ borderLeftWidth: 3, borderLeftColor: c.info, backgroundColor: c.infoSoft, borderTopRightRadius: radius.inner, borderBottomRightRadius: radius.inner, padding: space(4) }}>
            <Body style={{ fontSize: 16, lineHeight: 24 }}>{phrase.explanation_ua}</Body>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- dialogue (chat bubbles, translation hidden by default)
export function DialogueView({ dialogue }: { dialogue: Dialogue }) {
  const { c } = useTheme();
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: space(2) }}>
      <Hand>{dialogue.title_ua}</Hand>
      {dialogue.lines.map((l, i) => (
        <View key={i} style={{ alignItems: l.me ? 'flex-end' : 'flex-start' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: c.muted, marginHorizontal: space(2), marginBottom: 2 }}>{l.who}</Text>
          <View
            style={{
              maxWidth: '88%',
              paddingVertical: space(2.5),
              paddingHorizontal: space(3.5),
              backgroundColor: l.me ? c.accentSoft : c.surface,
              borderWidth: l.me ? 0 : 1,
              borderColor: c.line,
              borderRadius: radius.bubble,
              borderTopLeftRadius: l.me ? radius.bubble : radius.bubbleTail,
              borderTopRightRadius: l.me ? radius.bubbleTail : radius.bubble,
              gap: 2,
            }}
          >
            <Text selectable style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: c.ink }}>{l.da}</Text>
            {show ? <Text selectable style={{ fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23, color: c.ua }}>{l.ua}</Text> : null}
          </View>
        </View>
      ))}
      <Button
        style={{ marginTop: space(2) }}
        label={show ? 'Сховати переклад' : 'Показати переклад'}
        icon={show ? EyeSlashIcon : EyeIcon}
        aria-expanded={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
}

// ---------------------------------------------------------------- Від перекладача: a message from Anna
export function AnnaNote({ body }: { body: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space(3), alignItems: 'flex-start' }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.accentInk, alignItems: 'center', justifyContent: 'center' }} aria-hidden>
        <Text style={{ fontFamily: fonts.heavy, fontSize: 17, color: c.onAccent }}>A</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: c.noteBg, borderWidth: 1, borderColor: c.noteLine, borderRadius: radius.card, borderTopLeftRadius: radius.bubbleTail, padding: space(5), gap: space(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LightbulbIcon size={20} color={c.accentInk} weight="duotone" />
          <Hand style={{ fontSize: 21 }}>Від перекладача</Hand>
        </View>
        <Body>{body}</Body>
        <Hand style={{ alignSelf: 'flex-end', fontSize: 20 }}>Anna</Hand>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- typical mistake
export function MistakeCard({ m }: { m: Mistake }) {
  const { c } = useTheme();
  return (
    <Surface style={{ gap: space(2) }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <XCircleIcon size={22} color={c.bad} weight="fill" aria-label="Неприродно" />
        <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 25, color: c.muted, textDecorationLine: 'line-through', textDecorationColor: c.bad }}>{m.wrong}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <CheckCircleIcon size={22} color={c.ok} weight="fill" aria-label="Краще" />
        <Text selectable style={{ flex: 1, fontFamily: fonts.heavy, fontSize: 18, lineHeight: 25, color: c.ink }}>{m.better}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: c.line, borderStyle: 'dashed', paddingTop: space(3), marginTop: space(1) }}>
        <LightbulbIcon size={20} color={c.info} />
        <Body style={{ flex: 1, fontSize: 16, lineHeight: 24 }}>
          <Text style={{ fontFamily: fonts.bold }}>Чому? </Text>
          {m.why_ua}
        </Body>
      </View>
    </Surface>
  );
}

// ---------------------------------------------------------------- ready-made message
export function MessageCard({ m }: { m: Message }) {
  const { c } = useTheme();
  const [copied, setCopied] = useState(false);
  return (
    <Surface style={{ gap: space(3), borderTopRightRadius: radius.card, borderBottomRightRadius: radius.bubbleTail, flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <ChatCircleTextIcon size={18} color={c.muted} />
        <Muted style={{ fontSize: 14, lineHeight: 20 }}>{m.audience_ua}</Muted>
      </View>
      <DaUa da={m.da} ua={m.ua} size="md" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
        <Button
          label={copied ? 'Скопійовано' : 'Скопіювати'}
          icon={copied ? CheckIcon : CopyIcon}
          onPress={async () => {
            await Clipboard.setStringAsync(m.da);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        />
        <SaveButton kind="message" id={m.id} />
      </View>
    </Surface>
  );
}

// ---------------------------------------------------------------- practice
export function Quiz({ ex, onAnswered }: { ex: Exercise; onAnswered?: (correct: boolean) => void }) {
  const { c } = useTheme();
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked === ex.correct;
  return (
    <Surface style={{ gap: space(2) }}>
      <H3 style={{ fontSize: 19, marginBottom: space(1) }}>{ex.question_ua}</H3>
      <View role="radiogroup" style={{ gap: 8 }}>
        {ex.options.map((o, i) => {
          const chosen = picked === i;
          const state = chosen ? (right ? 'right' : 'wrong') : null;
          return (
            <Tap
              key={i}
              role="radio"
              aria-checked={chosen}
              onPress={() => {
                setPicked(i);
                onAnswered?.(i === ex.correct);
              }}
              pressStyle={({ hovered }) => ({
                minHeight: 50,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: space(4),
                paddingVertical: space(2.5),
                borderRadius: radius.inner,
                borderWidth: 1.5,
                borderColor: state === 'right' ? c.ok : state === 'wrong' ? c.bad : hovered ? c.accent : c.line,
                backgroundColor: state === 'right' ? c.ok + '1F' : state === 'wrong' ? c.bad + '1A' : c.surface2,
              })}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: state ? (right ? c.ok : c.bad) : c.muted, backgroundColor: state === 'right' ? c.ok : 'transparent' }} />
              <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 17, color: c.ink }}>{o}</Text>
            </Tap>
          );
        })}
      </View>
      <View aria-live="polite" style={{ minHeight: 28, marginTop: space(1) }}>
        {picked !== null &&
          (right ? (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircleIcon size={22} color={c.ok} weight="fill" />
                <Text style={{ fontFamily: fonts.heavy, fontSize: 17, color: c.ok }}>Правильно!</Text>
              </View>
              {ex.explain_ua ? <Muted style={{ fontSize: 15 }}>{ex.explain_ua}</Muted> : null}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <XCircleIcon size={22} color={c.bad} weight="fill" />
              <Text style={{ fontFamily: fonts.heavy, fontSize: 17, color: c.bad }}>Спробуйте ще раз.</Text>
            </View>
          ))}
      </View>
    </Surface>
  );
}

// ---------------------------------------------------------------- mini-dictionary
export function VocabGrid({ items, columns }: { items: Vocab[]; columns: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space(3) }}>
      {items.map((v) => (
        <View key={v.id} style={{ width: `${100 / columns}%`, paddingRight: space(4) }}>
          <Text selectable style={{ fontFamily: fonts.heavy, fontSize: 17, color: c.ink }}>{v.da}</Text>
          <Text selectable style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.ua }}>{v.ua}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------- chapter cards
export function ChapterCard({ ch, done, visited }: { ch: Chapter; done: boolean; visited: boolean }) {
  const { c } = useTheme();
  return (
    <Spotlight>
      <Link href={{ pathname: '/chapter/[id]', params: { id: String(ch.id) } }} asChild>
        <Tap
          role="link"
          accessibilityLabel={`Розділ ${ch.id}: ${ch.title_da}${done ? ', пройдено' : ''}`}
          pressStyle={({ hovered, pressed }) => ({
            flex: 1,
            minHeight: 170,
            padding: space(5),
            borderRadius: radius.card,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: hovered ? c.accent + '88' : c.line,
            boxShadow: `0 18px 36px -26px ${c.shadow}`,
            gap: 6,
            transform: [{ translateY: hovered ? -2 : 0 }, { scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: done ? c.accentInk : c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              {done ? <CheckIcon size={18} color={c.onAccent} weight="bold" /> : <Text style={{ fontFamily: fonts.heavy, fontSize: 14, color: c.accentInk }}>{ch.id}</Text>}
            </View>
            {visited && !done ? <Muted style={{ fontSize: 13 }}>відкрито</Muted> : null}
          </View>
          <H3 style={{ fontSize: 20 }}>{ch.title_da}</H3>
          <Muted style={{ fontSize: 15, lineHeight: 22, flex: 1 }}>{ch.description_ua}</Muted>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: c.muted }}>{ch.phrase_count} фраз</Text>
            {done ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckIcon size={15} color={c.ok} weight="bold" />
                <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: c.ok }}>пройдено</Text>
              </View>
            ) : null}
          </View>
        </Tap>
      </Link>
    </Spotlight>
  );
}
