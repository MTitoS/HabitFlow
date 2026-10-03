import { earnedAchievements } from '@/domain/stats/earnedAchievements';
import { Achievement, achievements, DerivedStats } from '@/domain/stats/achievements';
import { getSeenAchievements, markAchievementSeen } from '@/services/prefs';

export interface UseAchievementsResult {
  earned: Achievement[];
  newlyEarned: Achievement[];
  allCompleteToday: boolean;
}

export async function computeAchievements(stats: DerivedStats): Promise<UseAchievementsResult> {
  const all = achievements(stats);
  const seen = await getSeenAchievements();
  const result = earnedAchievements(all, seen);
  const persisted = new Set(seen);
  let changed = false;
  for (const achievement of result.newAchievements) {
    persisted.add(achievement.id);
    changed = true;
  }
  if (changed) {
    for (const id of [...persisted]) {
      await markAchievementSeen(id);
    }
  }
  return {
    earned: result.allEarned,
    newlyEarned: result.newAchievements,
    allCompleteToday: stats.scheduledToday > 0 && stats.completedToday === stats.scheduledToday,
  };
}