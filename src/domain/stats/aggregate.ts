import { addDays, monthStartOf, monthKey, todayKey, weekStartOf } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { HabitRecord, indexRecords } from '@/domain/record/model';
import { currentStreak, bestStreak } from '@/domain/streak/currentStreak';
import { computeOverallStreaks } from '@/domain/streak/overallStreak';
import { OPEN } from '@/config/opens';

export interface DaySummary {
  scheduledToday: number;
  completedToday: number;
  percent: number;
  totalActive: number;
  overallCurrentStreak: number;
  overallBestStreak: number;
  dayStreakCurrent: number;
  dayStreakBest: number;
}

export interface DayPoint {
  dateKey: string;
  scheduled: number;
  completed: number;
  percent: number;
  done: number;
  skipped: number;
  undone: number;
  monthDay: number;
  weekday: string;
}

export interface Totals {
  completions: number;
  skips: number;
  activeHabits: number;
}

export interface DayComposition {
  scheduled: number;
  done: number;
  skipped: number;
  undone: number;
}

export function composeDay(
  activeHabits: Habit[],
  recordsByHabit: Map<string, Map<string, HabitRecord>>,
  dateKey: string,
): DayComposition {
  let scheduled = 0;
  let done = 0;
  let skipped = 0;

  for (const habit of activeHabits) {
    if (habit.archivedAt) continue;
    if (!isScheduled(habit, dateKey)) continue;
    scheduled += 1;
    const status = recordsByHabit.get(habit.id)?.get(dateKey)?.status;
    if (status === 'completed') done += 1;
    else if (status === 'skipped') skipped += 1;
  }

  return { scheduled, done, skipped, undone: scheduled - done - skipped };
}

function activeHabits(habits: Habit[]): Habit[] {
  return habits.filter((h) => !h.archivedAt);
}

export function completedOn(records: HabitRecord[], dateKey: string): number {
  return records.filter((r) => r.status === 'completed' && r.date === dateKey).length;
}

export function daySummary(habits: Habit[], records: HabitRecord[], now: Date): DaySummary {
  const active = activeHabits(habits);
  const today = todayKey(now);

  const scheduledToday = active.filter((h) => isScheduled(h, today)).length;

  const completedToday = completedOn(records, today);
  const percent = scheduledToday > 0 ? completedToday / scheduledToday : 0;

  let current = 0;
  let best = 0;
  for (const habit of active) {
    const c = currentStreak(habit, records, now);
    const b = bestStreak(habit, records, now);
    if (c > current) current = c;
    if (b > best) best = b;
  }

  const overall = computeOverallStreaks(active, records, now);

  return {
    scheduledToday,
    completedToday,
    percent,
    totalActive: active.length,
    overallCurrentStreak: current,
    overallBestStreak: best,
    dayStreakCurrent: overall.current,
    dayStreakBest: overall.best,
  };
}

export function weeklySeries(habits: Habit[], records: HabitRecord[], now: Date, weekStarts = OPEN.FREQ_WEEK_STARTS): DayPoint[] {
  const active = activeHabits(habits);
  const byHabit = indexRecords(records);
  const start = weekStartOf(todayKey(now), weekStarts);
  const points: DayPoint[] = [];

  for (let i = 0; i < 7; i += 1) {
    const dateKey = addDays(start, i);
    const scheduled = active.filter((h) => isScheduled(h, dateKey)).length;
    const completed = completedOn(records, dateKey);
    const composition = composeDay(active, byHabit, dateKey);
    points.push({
      dateKey,
      scheduled,
      completed,
      percent: scheduled > 0 ? completed / scheduled : 0,
      done: composition.done,
      skipped: composition.skipped,
      undone: composition.undone,
      monthDay: Number(dateKey.slice(8)),
      weekday: dateKey,
    });
  }

  return points;
}

export function monthlySeries(habits: Habit[], records: HabitRecord[], now: Date): DayPoint[] {
  const active = activeHabits(habits);
  const byHabit = indexRecords(records);
  const start = monthStartOf(todayKey(now));
  const month = monthKey(start);
  const first = new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)) - 1);
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const points: DayPoint[] = [];

  for (let i = 0; i < length; i += 1) {
    const dateKey = addDays(start, i);
    if (monthKey(dateKey) !== month) continue;
    const scheduled = active.filter((h) => isScheduled(h, dateKey)).length;
    const completed = completedOn(records, dateKey);
    const composition = composeDay(active, byHabit, dateKey);
    points.push({
      dateKey,
      scheduled,
      completed,
      percent: scheduled > 0 ? completed / scheduled : 0,
      done: composition.done,
      skipped: composition.skipped,
      undone: composition.undone,
      monthDay: i + 1,
      weekday: dateKey,
    });
  }

  return points;
}

export function totals(habits: Habit[], records: HabitRecord[]): Totals {
  return {
    completions: records.filter((r) => r.status === 'completed').length,
    skips: records.filter((r) => r.status === 'skipped').length,
    activeHabits: activeHabits(habits).length,
  };
}