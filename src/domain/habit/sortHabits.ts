import { Habit } from '@/domain/habit/model';

export type HabitSortMode = 'added' | 'routine' | 'alpha';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function filterHabitsByName(habits: Habit[], query: string): Habit[] {
  const normalized = normalize(query.trim());
  if (!normalized) return habits;
  return habits.filter((habit) => normalize(habit.name).includes(normalized));
}

export function sortHabits(habits: Habit[], mode: HabitSortMode, locale = 'pt-BR'): Habit[] {
  const copy = [...habits];

  switch (mode) {
    case 'alpha':
      return copy.sort((a, b) => a.name.localeCompare(b.name, locale));
    case 'routine': {
      const withRoutine = copy.filter((h) => Boolean(h.routineId));
      const withoutRoutine = copy.filter((h) => !h.routineId);
      withRoutine.sort((a, b) => {
        const ra = a.routineId as string;
        const rb = b.routineId as string;
        return ra < rb ? -1 : ra > rb ? 1 : 0;
      });
      return [...withRoutine, ...withoutRoutine];
    }
    case 'added':
    default:
      return copy;
  }
}
