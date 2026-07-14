import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getVerseOfDay, Verse } from '@/database/bible';
import { useBibleTranslation } from '@/hooks/useBibleTranslation';

export function useDailyVerse() {
  const db = useSQLiteContext();
  const { translation } = useBibleTranslation();
  const [verse, setVerse] = useState<Verse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVerseOfDay(db, translation).then((v) => {
      if (!cancelled) setVerse(v);
    });
    return () => {
      cancelled = true;
    };
  }, [db, translation]);

  return verse;
}
