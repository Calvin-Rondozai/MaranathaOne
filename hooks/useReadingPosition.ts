import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getKv, setKv } from '@/database/kv';

const KEY = 'bible_reading_position';

export type ReadingPosition = { book: string; chapter: number };

// Every useReadingPosition() call is an independent hook instance with its own state,
// so remounting the Bible home screen used to reset to null and flash the "Continue
// Reading" card away until the async DB read resolved again. Cache the last known
// value at module scope so remounts start from it instead of null.
let cachedPosition: ReadingPosition | null = null;
let cacheLoaded = false;

export function useReadingPosition() {
  const db = useSQLiteContext();
  const [position, setPositionState] = useState<ReadingPosition | null>(cachedPosition);
  const [loaded, setLoaded] = useState(cacheLoaded);

  useEffect(() => {
    if (cacheLoaded) return;
    let cancelled = false;
    getKv(db, KEY).then((value) => {
      if (cancelled) return;
      if (value) {
        try {
          cachedPosition = JSON.parse(value);
          setPositionState(cachedPosition);
        } catch {
          // ignore corrupt value
        }
      }
      cacheLoaded = true;
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const setPosition = useCallback(
    (next: ReadingPosition) => {
      cachedPosition = next;
      cacheLoaded = true;
      setPositionState(next);
      setKv(db, KEY, JSON.stringify(next)).catch(() => {});
    },
    [db]
  );

  return { position, setPosition, loaded };
}
