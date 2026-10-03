import { Weekday } from '@/domain/date/dateUtils';
import { ColorToken } from '@/theme/types';

export type HabitType = 'binary' | 'quantitative';

export type PredefinedUnit =
  | 'vezes'
  | 'minutos'
  | 'horas'
  | 'paginas'
  | 'litros'
  | 'ml'
  | 'passos'
  | 'km'
  | 'repeticoes'
  | 'sessoes';

export type FrequencyKind = 'daily' | 'weekdays' | 'x_per_week' | 'x_per_month';

export interface Schedule {
  days?: Weekday[];
  countPerPeriod?: number;
}

export interface Frequency {
  kind: FrequencyKind;
  schedule: Schedule;
}

export interface ReminderConfig {
  enabled: boolean;
  times: string[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: ColorToken;
  type: HabitType;
  targetValue?: number;
  unit?: PredefinedUnit;
  customUnit?: string;
  frequency: Frequency;
  routineId?: string;
  scheduledTime?: string;
  reminder?: ReminderConfig;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: ColorToken;
  order: number;
}

export function habitUnit(h: Habit): string {
  if (h.customUnit) return h.customUnit;
  return h.unit ?? 'vezes';
}