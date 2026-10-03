import { achievements, DerivedStats } from '@/domain/stats/achievements';

function stats(overrides: Partial<DerivedStats>): DerivedStats {
  return {
    currentStreak: 0,
    bestStreak: 0,
    totalCompletions: 0,
    scheduledToday: 0,
    completedToday: 0,
    ...overrides,
  };
}

describe('achievements', () => {
  it('returns none for zero stats', () => {
    expect(achievements(stats({}))).toEqual([]);
  });

  it('unlocks 7d and 30d streak thresholds', () => {
    const ids = achievements(stats({ currentStreak: 30 })).map((a) => a.id);
    expect(ids).toContain('streak_7');
    expect(ids).toContain('streak_30');
  });

  it('unlocks completion milestones', () => {
    const ids = achievements(stats({ totalCompletions: 365 })).map((a) => a.id);
    expect(ids).toContain('completions_100');
    expect(ids).toContain('completions_365');
  });

  it('unlocks all-done-today only when everything scheduled is completed', () => {
    const done = achievements(stats({ scheduledToday: 3, completedToday: 3 })).map((a) => a.id);
    expect(done).toContain('all_done_today');

    const partial = achievements(stats({ scheduledToday: 3, completedToday: 2 })).map((a) => a.id);
    expect(partial).not.toContain('all_done_today');
  });

  it('never unlocks with no scheduled today', () => {
    const ids = achievements(stats({ scheduledToday: 0, completedToday: 0 })).map((a) => a.id);
    expect(ids).not.toContain('all_done_today');
  });
});