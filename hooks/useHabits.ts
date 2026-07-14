import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  addExercise,
  addWater,
  EXERCISE_GOAL_MIN,
  EXERCISE_STEP_MIN,
  getHabitsForDate,
  getStreak,
  getWeekCompletion,
  HabitType,
  todayKey,
  toggleHabit,
  WATER_GOAL_ML,
  WATER_STEP_ML,
  WeekDay,
} from '@/database/habits';
import { getExerciseGoal, getWaterGoal } from '@/database/wellnessGoals';

const STREAK_TYPES: HabitType[] = ['bible_study', 'prayer', 'exercise'];
const HABIT_TYPES: HabitType[] = ['bible_study', 'prayer', 'water', 'exercise'];

export function useHabits() {
  const db = useSQLiteContext();
  const [date] = useState(() => todayKey());
  const [completed, setCompleted] = useState<Record<HabitType, boolean>>({
    bible_study: false,
    prayer: false,
    water: false,
    exercise: false,
  });
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoalMl, setWaterGoalMl] = useState(WATER_GOAL_ML);
  const [exerciseMin, setExerciseMin] = useState(0);
  const [exerciseGoalMin, setExerciseGoalMin] = useState(EXERCISE_GOAL_MIN);
  const [streaks, setStreaks] = useState<Record<HabitType, number>>({
    bible_study: 0,
    prayer: 0,
    water: 0,
    exercise: 0,
  });
  const [week, setWeek] = useState<Record<HabitType, WeekDay[]>>({
    bible_study: [],
    prayer: [],
    water: [],
    exercise: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [rows, wGoal, eGoal] = await Promise.all([
      getHabitsForDate(db, date),
      getWaterGoal(db),
      getExerciseGoal(db),
    ]);
    setWaterGoalMl(wGoal);
    setExerciseGoalMin(eGoal);

    const nextCompleted = { bible_study: false, prayer: false, water: false, exercise: false } as Record<
      HabitType,
      boolean
    >;
    let nextWater = 0;
    let nextExercise = 0;
    for (const row of rows) {
      nextCompleted[row.habit_type] = !!row.completed;
      if (row.habit_type === 'water') nextWater = row.value;
      if (row.habit_type === 'exercise') nextExercise = row.value;
    }
    setCompleted(nextCompleted);
    setWaterMl(nextWater);
    setExerciseMin(nextExercise);

    const nextStreaks: Record<HabitType, number> = { bible_study: 0, prayer: 0, water: 0, exercise: 0 };
    for (const type of STREAK_TYPES) {
      nextStreaks[type] = await getStreak(db, type);
    }
    setStreaks(nextStreaks);

    const nextWeek = {} as Record<HabitType, WeekDay[]>;
    for (const type of HABIT_TYPES) {
      nextWeek[type] = await getWeekCompletion(db, type);
    }
    setWeek(nextWeek);

    setLoading(false);
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (type: HabitType) => {
      await toggleHabit(db, type, date);
      await refresh();
    },
    [db, date, refresh]
  );

  const drinkWater = useCallback(async () => {
    await addWater(db, date, WATER_STEP_ML);
    await refresh();
  }, [db, date, refresh]);

  const undoWater = useCallback(async () => {
    await addWater(db, date, -WATER_STEP_ML);
    await refresh();
  }, [db, date, refresh]);

  const exercise = useCallback(async () => {
    await addExercise(db, date, EXERCISE_STEP_MIN, exerciseGoalMin);
    await refresh();
  }, [db, date, exerciseGoalMin, refresh]);

  return {
    loading,
    completed,
    streaks,
    week,
    waterMl,
    waterGoalMl,
    waterStepMl: WATER_STEP_ML,
    exerciseMin,
    exerciseGoalMin,
    toggle,
    drinkWater,
    undoWater,
    exercise,
  };
}
