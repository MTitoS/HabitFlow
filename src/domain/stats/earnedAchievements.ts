import { Achievement } from '@/domain/stats/achievements';

export interface EarnedResult {
  newAchievements: Achievement[];
  allEarned: Achievement[];
}

export function earnedAchievements(all: Achievement[], seen: Set<string>): EarnedResult {
  const allEarned = all;
  const newAchievements = all.filter((a) => !seen.has(a.id));
  return { newAchievements, allEarned };
}