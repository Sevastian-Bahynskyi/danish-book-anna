import { SpeakerHighIcon } from 'phosphor-react-native';
import { useState, type ReactElement } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/ui';
import { playDanishAudio } from '@/lib/audio';

export function AudioButton({ text }: { text: string }): ReactElement {
  const [loading, setLoading] = useState(false);

  const play = async () => {
    setLoading(true);
    try {
      await playDanishAudio(text);
    } catch {
      Alert.alert('Аудіо недоступне', 'Не вдалося відтворити запис. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return <Button label="Слухати" icon={SpeakerHighIcon} loading={loading} onPress={play} />;
}
