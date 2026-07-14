import type { SQLiteDatabase } from 'expo-sqlite';
import { getKv, setKv } from './kv';
import { EXERCISE_GOAL_MIN, WATER_GOAL_ML } from './habits';

const WATER_GOAL_KEY = 'water_goal_ml';
const EXERCISE_GOAL_KEY = 'exercise_goal_min';

export async function getWaterGoal(db: SQLiteDatabase): Promise<number> {
  const value = await getKv(db, WATER_GOAL_KEY);
  return value ? Number(value) : WATER_GOAL_ML;
}

export async function setWaterGoal(db: SQLiteDatabase, goalMl: number): Promise<void> {
  await setKv(db, WATER_GOAL_KEY, String(goalMl));
}

export async function getExerciseGoal(db: SQLiteDatabase): Promise<number> {
  const value = await getKv(db, EXERCISE_GOAL_KEY);
  return value ? Number(value) : EXERCISE_GOAL_MIN;
}

export async function setExerciseGoal(db: SQLiteDatabase, goalMinutes: number): Promise<void> {
  await setKv(db, EXERCISE_GOAL_KEY, String(goalMinutes));
}
