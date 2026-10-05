import { filterHabitsByName, sortHabits } from '@/domain/habit/sortHabits';
import { Habit } from '@/domain/habit/model';

function habit(id: string, name: string, routineId?: string): Habit {
  return {
    id,
    name,
    icon: 'circle',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    routineId,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('sortHabits', () => {
  it('alpha orders A-Z with localeCompare', () => {
    const habits = [habit('1', 'Zebra'), habit('2', 'Água'), habit('3', 'Leitura')];
    const sorted = sortHabits(habits, 'alpha').map((h) => h.name);
    expect(sorted).toEqual(['Água', 'Leitura', 'Zebra']);
  });

  it('added preserves the received order', () => {
    const habits = [habit('3', 'C'), habit('1', 'A'), habit('2', 'B')];
    expect(sortHabits(habits, 'added').map((h) => h.id)).toEqual(['3', '1', '2']);
  });

  it('routine groups by routineId with no-routine last', () => {
    const habits = [
      habit('1', 'Sem rotina'),
      habit('2', 'Rotina B', 'rb'),
      habit('3', 'Rotina A', 'ra'),
    ];
    const sorted = sortHabits(habits, 'routine');
    expect(sorted.map((h) => h.id)).toEqual(['3', '2', '1']);
  });
});

describe('filterHabitsByName', () => {
  const habits = [habit('1', 'Leitura'), habit('2', 'Água'), habit('3', 'Correr')];

  it('is case and accent insensitive', () => {
    expect(filterHabitsByName(habits, 'leitura').map((h) => h.id)).toEqual(['1']);
    expect(filterHabitsByName(habits, 'agua').map((h) => h.id)).toEqual(['2']);
    expect(filterHabitsByName(habits, 'ÁGUA').map((h) => h.id)).toEqual(['2']);
  });

  it('empty query returns all', () => {
    expect(filterHabitsByName(habits, '  ')).toHaveLength(3);
  });

  it('no match returns empty', () => {
    expect(filterHabitsByName(habits, 'xyz')).toHaveLength(0);
  });
});
