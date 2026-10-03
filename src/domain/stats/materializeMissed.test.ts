import { statusForView } from '@/domain/stats/materializeMissed';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

function habit(): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    icon: 'book',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: 0,
    updatedAt: 0,
  };
}

const rec = (date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `h1__${date}`,
  habitId: 'h1',
  date,
  status,
});

describe('materializeMissed', () => {
  const now = new Date(2026, 4, 6, 9, 0, 0); // 2026-05-06

  it('derives missed for a past scheduled day without record', () => {
    expect(statusForView(habit(), [], '2026-05-05', now)).toBe('missed');
  });

  it('keeps today pending', () => {
    expect(statusForView(habit(), [], '2026-05-06', now)).toBe('pending');
  });

  it('keeps future pending', () => {
    expect(statusForView(habit(), [], '2026-05-07', now)).toBe('pending');
  });

  it('returns null for non-scheduled days', () => {
    const h = habit();
    h.frequency = { kind: 'weekdays', schedule: { days: ['mon'] } };
    expect(statusForView(h, [], '2026-05-09', now)).toBe(null);
  });

  it('preserves completed and skipped facts', () => {
    expect(statusForView(habit(), [rec('2026-05-05', 'completed')], '2026-05-05', now)).toBe(
      'completed',
    );
    expect(statusForView(habit(), [rec('2026-05-05', 'skipped')], '2026-05-05', now)).toBe('skipped');
  });
});