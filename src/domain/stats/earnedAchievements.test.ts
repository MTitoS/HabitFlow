import { earnedAchievements } from '@/domain/stats/earnedAchievements';
import { Achievement } from '@/domain/stats/achievements';

const seen = new Set<string>(['streak_7', 'completions_100', 'all_done_today']);

describe('earnedAchievements', () => {
  it('returns new achievements not yet seen', () => {
    const all: Achievement[] = [
      { id: 'streak_7', title: '7 dias' },
      { id: 'streak_30', title: '30 dias' },
    ];
    const result = earnedAchievements(all, seen);
    expect(result.newAchievements.map((a) => a.id)).toEqual(['streak_30']);
    expect(result.allEarned.map((a) => a.id)).toEqual(['streak_7', 'streak_30']);
  });

  it('is idempotent when nothing is new', () => {
    const all: Achievement[] = [{ id: 'streak_7', title: '7 dias' }];
    const result = earnedAchievements(all, seen);
    expect(result.newAchievements).toEqual([]);
  });
});