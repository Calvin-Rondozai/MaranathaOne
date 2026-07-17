import { useEffect, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { getKv, setKv } from '@/database/kv';
import { getGreeting, Coordinates } from '@/utils/greeting';

const LOCATION_KV_KEY = 'last_known_location';
const REFRESH_INTERVAL_MS = 60_000; // recompute each minute so the 5pm/sunset boundaries flip live

function parseCachedLocation(raw: string | null): Coordinates | null {
  if (!raw) return null;
  const [lat, lon] = raw.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { latitude: lat, longitude: lon };
}

async function resolveLocation(db: SQLiteDatabase): Promise<Coordinates | null> {
  const cached = parseCachedLocation(await getKv(db, LOCATION_KV_KEY));
  try {
    const Location = require('expo-location') as typeof import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return cached;

    const last = await Location.getLastKnownPositionAsync().catch(() => null);
    const position =
      last ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }).catch(() => null));
    if (!position) return cached;

    const coords: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    await setKv(db, LOCATION_KV_KEY, `${coords.latitude},${coords.longitude}`);
    return coords;
  } catch {
    // Location module unavailable (e.g. Expo Go) — fall back to whatever was cached before.
    return cached;
  }
}

// Drives the home screen's Friday/Saturday Sabbath greeting: Friday is a fixed 5pm cutover to
// "Happy Sabbath", but Saturday's end-of-Sabbath needs the real local sunset, which needs the
// device's location. Resolves that once (cached in the DB so later opens don't need a fresh
// GPS fix) and recomputes the greeting text every minute so the transition happens live if the
// app is left open across a boundary.
export function useSabbathGreeting(): string {
  const db = useSQLiteContext();
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveLocation(db).then((coords) => {
      if (!cancelled) setLocation(coords);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return getGreeting(now, location);
}
