import { Habit } from '@/domain/habit/model';

export type HabitValidation = { ok: true } | { ok: false; errors: string[] };

export function validateHabit(habit: Pick<Habit, 'name' | 'type' | 'targetValue' | 'unit' | 'customUnit' | 'frequency'>): HabitValidation {
  const errors: string[] = [];

  if (!habit.name || habit.name.trim().length === 0) {
    errors.push('name_required');
  }

  if (habit.frequency.kind === 'weekdays' && habit.frequency.schedule.days?.length === 0) {
    errors.push('weekdays_require_days');
  }

  if (habit.frequency.kind === 'x_per_week' || habit.frequency.kind === 'x_per_month') {
    const count = habit.frequency.schedule.countPerPeriod;
    if (count == null || count < 1) {
      errors.push('count_required');
    }
  }

  if (habit.type === 'quantitative') {
    if (habit.targetValue == null || habit.targetValue <= 0) {
      errors.push('quant_requires_target');
    }
    if ((!habit.unit || habit.unit.length === 0) && (!habit.customUnit || habit.customUnit.trim().length === 0)) {
      errors.push('quant_requires_unit');
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}