import type { SQLiteDatabase } from 'expo-sqlite';
import { getKv, setKv } from './kv';
import type { ReadingPlan } from './readingPlans';

const KEY = 'custom_reading_plans';

export async function getCustomPlans(db: SQLiteDatabase): Promise<ReadingPlan[]> {
  const value = await getKv(db, KEY);
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

async function saveCustomPlans(db: SQLiteDatabase, plans: ReadingPlan[]): Promise<void> {
  await setKv(db, KEY, JSON.stringify(plans));
}

export async function addCustomPlan(db: SQLiteDatabase, plan: ReadingPlan): Promise<void> {
  const plans = await getCustomPlans(db);
  plans.push(plan);
  await saveCustomPlans(db, plans);
}

export async function deleteCustomPlan(db: SQLiteDatabase, id: string): Promise<void> {
  const plans = await getCustomPlans(db);
  await saveCustomPlans(
    db,
    plans.filter((p) => p.id !== id)
  );
}
