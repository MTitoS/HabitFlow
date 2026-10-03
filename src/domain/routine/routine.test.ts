import { groupHabitsByRoutine, scheduledForDay } from '@/domain/routine/group';
import { sortByTime } from '@/domain/routine/order';
import { Habit, Routine } from '@/domain/habit/model';

function habit(id: string, overrides: Partial<Habit> = {}): Habit {
  return {
    id,
    name: `H${id}`,
    icon: 'circle',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function routine(id: string, order: number): Routine {
  return { id, name: id, order };
}

describe('routine grouping', () => {
  it('groups habits by routine respecting routine order', () => {
    const late = routine('r1', 4);
    const early = routine('r2', 1);
    const habits = [
      habit('a', { routineId: 'r1' }),
      habit('b', { routineId: 'r1' }),
      habit('c', { routineId: 'r2' }),
      habit('d'),
    ];
    const groups = groupHabitsByRoutine(habits, [late, early]);
    expect(groups[0].routine?.id).toBe('r2');
    expect(groups[1].routine?.id).toBe('r1');
    expect(groups[2].routine).toBeUndefined();
    expect(groups[2].habitIds).toEqual(['d']);
  });

  it('puts habits with dangling routineId into no-routine group', () => {
    const groups = groupHabitsByRoutine([habit('a', { routineId: 'gone' })], []);
    expect(groups[0].habitIds).toEqual(['a']);
  });

  it('scheduledForDay filters by isScheduled', () => {
    const habits = [
      habit('daily'),
      habit('wk', { frequency: { kind: 'weekdays', schedule: { days: ['mon'] } } }),
    ];
    const onMonday = scheduledForDay(habits, '2026-05-04');
    expect(onMonday.map((h) => h.id)).toEqual(['daily', 'wk']);
    const onSunday = scheduledForDay(habits, '2026-05-10');
    expect(onSunday.map((h) => h.id)).toEqual(['daily']);
  });
});

describe('routine order', () => {
  it('puts unscheduled habits at the end and sorts by time asc', () => {
    const habits = [
      habit('late', { name: 'Z' }),
      habit('early', { scheduledTime: '06:30', name: 'A' }),
      habit('mid', { scheduledTime: '08:00', name: 'B' }),
    ];
    expect(sortByTime(habits).map((h) => h.id)).toEqual(['early', 'mid', 'late']);
  });

  it('breaks time ties by name', () => {
    const habits = [
      habit('b', { scheduledTime: '07:00', name: 'B' }),
      habit('a', { scheduledTime: '07:00', name: 'A' }),
    ];
    expect(sortByTime(habits).map((h) => h.id)).toEqual(['a', 'b']);
  });
});