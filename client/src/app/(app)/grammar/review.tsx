import { Link } from 'expo-router';
import { ArrowLeftIcon, ArrowRightIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Quiz } from '@/components/book';
import { GrammarText } from '@/components/GrammarText';
import { Screen, Section } from '@/components/Screen';
import { Footer } from '@/components/shared';
import { Body, Button, Field, H1, H2, Muted, Surface } from '@/components/ui';
import { grammarContent } from '@/lib/grammar';
import { fonts, space } from '@/theme';

const groups = [...new Set(grammarContent.quiz.map((question) => question.group))];

export default function GrammarReview() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [round, setRound] = useState(0);
  const [sentence, setSentence] = useState('');
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;

  return (
    <Screen>
      <Section style={{ paddingTop: space(8) }}>
        <Link href="/grammar" asChild><Button label="Усі теми" icon={ArrowLeftIcon} variant="ghost" /></Link>
        <Muted style={{ fontFamily: fonts.bold, letterSpacing: 1.3 }}>ПОВТОРЕННЯ</Muted>
        <H1>Шпаргалка і тест</H1>
        <Body>Прочитайте короткі моделі, а потім оберіть відповіді. До кожної теми можна повернутися в будь-який момент.</Body>
      </Section>

      <Section>
        <H2>Фінальна шпаргалка</H2>
        <GrammarText text={grammarContent.extras['ФІНАЛЬНА ШПАРГАЛКА']} />
      </Section>

      <Section>
        <H2>Фінальний інтерактивний тест</H2>
        <Muted>{answered} / {grammarContent.quiz.length} відповідей · {correct} правильних</Muted>
        {groups.map((group) => (
          <View key={group} style={{ gap: space(3), maxWidth: 760, marginTop: space(4) }}>
            <H2>{group}</H2>
            {grammarContent.quiz.filter((question) => question.group === group).map((question) => (
              <Quiz
                key={`${round}-${question.id}`}
                ex={{ id: question.id, chapter_id: 0, question_ua: `${question.id}. ${question.prompt.replace(/  \n/g, '\n') || 'Оберіть правильне речення.'}`, options: question.options, correct: question.correct, explain_ua: null }}
                onAnswered={(isCorrect) => setAnswers((current) => ({ ...current, [question.id]: isCorrect }))}
              />
            ))}
          </View>
        ))}
      </Section>

      {answered === grammarContent.quiz.length ? (
        <Section>
          <Surface tone="note" style={{ gap: space(3), maxWidth: 760 }}>
            <H2>{correct === grammarContent.quiz.length ? 'Чудова робота!' : 'Поверніться до складних тем'}</H2>
            <Body>{correct} з {grammarContent.quiz.length} відповідей правильні. {correct < grammarContent.quiz.length ? 'Помилки допомагають побачити, що варто повторити.' : 'Ви впізнаєте всі конструкції цього тесту.'}</Body>
            <Button label="Пройти ще раз" onPress={() => { setAnswers({}); setRound((value) => value + 1); }} />
          </Surface>
        </Section>
      ) : null}

      <Section>
        <GrammarText text={grammarContent.extras['Якщо ви зробили помилки']} />
      </Section>

      <Section>
        <H2>Створіть власне речення</H2>
        <GrammarText text={grammarContent.extras['💬 Створіть власне речення']} />
        <View style={{ maxWidth: 760 }}>
          <Field label="Ваше речення данською" value={sentence} onChangeText={setSentence} placeholder="I morgen…" multiline style={{ minHeight: 100, textAlignVertical: 'top', paddingTop: space(3) }} />
        </View>
      </Section>

      <Section>
        <H2>10 конструкцій, які варто запам’ятати</H2>
        <GrammarText text={grammarContent.extras["⭐ 10 КОНСТРУКЦІЙ, ЯКІ ВАРТО ЗАПАМ'ЯТАТИ"]} />
      </Section>

      <Section>
        <H2>На завершення</H2>
        <GrammarText text={grammarContent.extras['🌿 На завершення']} />
        <Link href="/grammar" asChild><Button label="Повернутися до тем" icon={ArrowRightIcon} variant="primary" /></Link>
      </Section>
      <Footer />
    </Screen>
  );
}
