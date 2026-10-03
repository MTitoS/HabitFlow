import { Habit, Routine } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';

export interface HabitGroup {
  routine?: Routine;
  habitIds: string[];
}

export function groupHabitsByRoutine(habits: Habit[], routines: Routine[]): HabitGroup[] {
  const routineById = new Map(routines.map((r) => [r.id, r]));
  const sortedById = (a: Habit, b: Habit): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

  const withRoutine = habits
    .filter((h) => h.routineId && routineById.has(h.routineId))
    .sort((a, b) => {
      const ra = routineById.get(a.routineId as string) as Routine;
      const rb = routineById.get(b.routineId as string) as Routine;
      return ra.order - rb.order;
    });

  const groups: HabitGroup[] = [];
  for (const habit of withRoutine) {
    const routine = routineById.get(habit.routineId as string) as Routine;
    let group = groups.find((g) => g.routine?.id === routine.id);
    if (!group) {
      group = { routine, habitIds: [] };
      groups.push(group);
    }
    group.habitIds.push(habit.id);
  }

  const withoutRoutine = habits
    .filter((h) => !h.routineId || !routineById.has(h.routineId))
    .sort(sortedById);

  if (withoutRoutine.length > 0) {
    groups.push({ habitIds: withoutRoutine.map((h) => h.id) });
  }

  return groups;
}

export function scheduledForDay(habits: Habit[], dateKey: string): Habit[] {
  return habits.filter((h) => isScheduled(h, dateKey));
}