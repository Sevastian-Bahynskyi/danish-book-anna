import { EyeIcon, EyeSlashIcon, HeartIcon, SpeakerHighIcon } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { playDanishAudio } from '@/lib/audio';
import { grammarExample, useGrammarSaved, useToggleGrammarSaved } from '@/lib/grammar';
import { fonts, radius, space, useTheme } from '@/theme';
import { Body, Button, H2, H3, Muted, Surface } from './ui';

function inline(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Text key={index} style={{ fontFamily: fonts.bold }}>{part.slice(2, -2)}</Text>
    ) : (
      part.replace(/  $/, '')
    ),
  );
}

function ExampleCard({ da, ua, id }: { da: string; ua: string; id: string }) {
  const { c } = useTheme();
  const [show, setShow] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const saved = useGrammarSaved();
  const toggle = useToggleGrammarSaved();
  const isSaved = saved.data?.includes(id) ?? false;
  const play = async (): Promise<void> => {
    setAudioLoading(true);
    setAudioError(false);
    try {
      await playDanishAudio(da);
    } catch {
      setAudioError(true);
    } finally {
      setAudioLoading(false);
    }
  };
  return (
    <Surface tone="soft" style={{ gap: space(3), maxWidth: 720 }}>
      <Text selectable style={{ fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: c.ink }}>{da}</Text>
      {show ? <Text selectable style={{ fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: c.ua }}>{ua}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button label="Слухати" icon={SpeakerHighIcon} loading={audioLoading} onPress={play} />
        <Button label={show ? 'Сховати переклад' : 'Показати переклад'} icon={show ? EyeSlashIcon : EyeIcon} aria-expanded={show} onPress={() => setShow(!show)} />
        <Button
          label={isSaved ? 'Збережено' : 'Зберегти'}
          icon={HeartIcon}
          iconWeight={isSaved ? 'fill' : 'regular'}
          variant={isSaved ? 'active' : 'secondary'}
          disabled={saved.isLoading || toggle.isPending}
          aria-pressed={isSaved}
          onPress={() => toggle.mutate(id)}
        />
      </View>
      {audioError ? <Muted style={{ color: c.bad, fontSize: 14 }}>Не вдалося відтворити аудіо на цьому пристрої.</Muted> : null}
    </Surface>
  );
}

export function GrammarText({ text, topicId }: { text: string; topicId?: string }) {
  const { c } = useTheme();
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return (
    <View style={{ gap: space(4), maxWidth: 760 }}>
      {blocks.map((block, index) => {
        const example = topicId ? grammarExample(block, topicId, index) : null;
        if (example) return <ExampleCard key={index} {...example} />;
        if (block === '---') return null;
        const heading = block.match(/^(#{1,3})\s+(.+)$/);
        if (heading) return heading[1].length <= 2 ? <H2 key={index}>{heading[2]}</H2> : <H3 key={index}>{heading[2]}</H3>;
        if (block.startsWith('> ')) {
          return (
            <View key={index} style={{ borderLeftWidth: 3, borderLeftColor: c.info, backgroundColor: c.infoSoft, borderTopRightRadius: radius.inner, borderBottomRightRadius: radius.inner, padding: space(4) }}>
              <Body>{inline(block.replace(/^>\s?/gm, '').replace(/  \n/g, '\n'))}</Body>
            </View>
          );
        }
        if (/^(?:\d+\.|[-*])\s/m.test(block) && block.split('\n').every((line) => /^(?:\d+\.|[-*])\s|^\s+|^$/.test(line))) {
          return (
            <View key={index} style={{ gap: space(2) }}>
              {block.split('\n').filter(Boolean).map((line, lineIndex) => (
                <Body key={lineIndex}>{inline(line.replace(/^[-*]\s+/, '• ').trim())}</Body>
              ))}
            </View>
          );
        }
        if (block.startsWith('❌') || block.startsWith('✅')) {
          return (
            <View key={index} style={{ gap: space(2) }}>
              {block.split('\n').filter(Boolean).map((line, lineIndex) => (
                <Body key={lineIndex} style={{ color: line.startsWith('❌') ? c.bad : line.startsWith('✅') ? c.ok : c.ink, fontFamily: fonts.semibold }}>
                  {inline(line.trim())}
                </Body>
              ))}
            </View>
          );
        }
        return <Muted key={index} style={{ color: c.ink }}>{inline(block.replace(/  \n/g, '\n'))}</Muted>;
      })}
    </View>
  );
}
