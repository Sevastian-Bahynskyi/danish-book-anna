import { Redirect } from 'expo-router';
import type { ReactElement } from 'react';

import { grammarChapters } from '@/lib/grammar';

// Grammar is now chapters 13 and 14 in the chapter list; old links land on 13.
export default function GrammarIndex(): ReactElement {
  return <Redirect href={{ pathname: '/chapter/[id]', params: { id: String(grammarChapters[0]?.id ?? 13) } }} />;
}
