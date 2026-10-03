import { Habit, habitUnit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

export interface QuantitativeStats {
  total: number;
  averagePerCompleted: number;
  daysCompleted: number;
  daysGoalMet: number;
  goalMetRate: number;
  unit: string;
  series: { dateKey: string; value: number }[];
}

export function quantitativeStats(habit: Habit, records: HabitRecord[]): QuantitativeStats {
  const completed = records
    .filter((r) => r.habitId === habit.id && r.status === 'completed')
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const series = completed
    .filter((r) => r.value != null)
    .map((r) => ({ dateKey: r.date, value: r.value as number }));

  const total = series.reduce((sum, p) => sum + p.value, 0);
  const daysCompleted = series.length;
  const averagePerCompleted = daysCompleted > 0 ? total / daysCompleted : 0;

  const target = habit.targetValue ?? 1;
  const daysGoalMet = series.filter((p) => p.value >= target).length;
  const goalMetRate = daysCompleted > 0 ? daysGoalMet / daysCompleted : 0;

  return {
    total,
    averagePerCompleted,
    daysCompleted,
    daysGoalMet,
    goalMetRate,
    unit: habitUnit(habit),
    series,
  };
}