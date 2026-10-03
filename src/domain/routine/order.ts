import { Habit } from '@/domain/habit/model';

export function compareTime(a?: string, b?: string): number {
  const timeOf = (t?: string): string => t ?? '\uffff';
  return timeOf(a) < timeOf(b) ? -1 : timeOf(a) > timeOf(b) ? 1 : 0;
}

export function sortByTime(habits: Habit[]): Habit[] {
  return habits.slice().sort((a, b) => {
    const hasA = a.scheduledTime != null;
    const hasB = b.scheduledTime != null;
    if (hasA !== hasB) return hasA ? -1 : 1;
    const timeCompare = compareTime(a.scheduledTime, b.scheduledTime);
    if (timeCompare !== 0) return timeCompare;
    return a.name.localeCompare(b.name);
  });
}

export function sortHabitsWithinGroup(habitsInGroup: Habit[]): Habit[] {
  return sortByTime(habitsInGroup);
}