import { bestStreak } from '@/domain/streak/currentStreak';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

function habit(): Habit {
  return {
    id: 'h1',
    name: 'Teste',
    icon: 'fire',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: new Date(2026, 3, 1).getTime(),
    updatedAt: 0,
  };
}

const rec = (date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `h1__${date}`,
  habitId: 'h1',
  date,
  status,
});

describe('bestStreak', () => {
  it('driver §7: best=3 across history even after a miss', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-08', 'completed'),
    ];
    expect(bestStreak(habit(), records, new Date(2026, 4, 8, 12, 0, 0))).toBe(3);
  });

  it('finds longest run across gaps', () => {
    const records = [
      rec('2026-05-01', 'completed'),
      rec('2026-05-02', 'completed'),
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-07', 'completed'),
      rec('2026-05-08', 'completed'),
    ];
    expect(bestStreak(habit(), records, new Date(2026, 4, 8, 12, 0, 0))).toBe(5);
  });

  it('empty history yields zero', () => {
    expect(bestStreak(habit(), [], new Date(2026, 4, 8, 12, 0, 0))).toBe(0);
  });
});