import { Frequency } from '@/domain/habit/model';
import { Weekday, WEEKDAY_LABELS } from '@/domain/date/dateUtils';

export function frequencyLabel(frequency: Frequency): string {
  switch (frequency.kind) {
    case 'daily':
      return 'Todos os dias';
    case 'weekdays': {
      const days = frequency.schedule.days ?? [];
      if (days.length === 0) return 'Dias da semana';
      if (days.length === 5 && ['mon', 'tue', 'wed', 'thu', 'fri'].every((d) => days.includes(d as Weekday))) {
        return 'Dias úteis';
      }
      return days.map((d) => WEEKDAY_LABELS[d]).join(' / ');
    }
    case 'x_per_week':
      return `${frequency.schedule.countPerPeriod ?? 1}x/semana`;
    case 'x_per_month':
      return `${frequency.schedule.countPerPeriod ?? 1}x/mês`;
    default:
      return '';
  }
}