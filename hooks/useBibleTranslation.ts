import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getKv, setKv } from '@/database/kv';
import { DEFAULT_TRANSLATION } from '@/database/translations';

const KEY = 'bible_translation';

export function useBibleTranslation() {
  const db = useSQLiteContext();
  const [translation, setTranslationState] = useState(DEFAULT_TRANSLATION);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getKv(db, KEY).then((value) => {
      if (cancelled) return;
      if (value) setTranslationState(value);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const setTranslation = useCallback(
    (next: string) => {
      setTranslationState(next);
      setKv(db, KEY, next).catch(() => {});
    },
    [db]
  );

  return { translation, setTranslation, loaded };
}
