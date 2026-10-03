export interface DerivedStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  scheduledToday: number;
  completedToday: number;
}

export const ACHIEVEMENT_THRESHOLDS = {
  streak7: 7,
  streak30: 30,
  completions100: 100,
  completions365: 365,
};

export interface Achievement {
  id: string;
  title: string;
}

export function achievements(stats: DerivedStats): Achievement[] {
  const list: Achievement[] = [];

  if (stats.currentStreak >= ACHIEVEMENT_THRESHOLDS.streak7) {
    list.push({ id: 'streak_7', title: '7 dias seguidos' });
  }
  if (stats.currentStreak >= ACHIEVEMENT_THRESHOLDS.streak30) {
    list.push({ id: 'streak_30', title: '30 dias seguidos' });
  }
  if (stats.totalCompletions >= ACHIEVEMENT_THRESHOLDS.completions100) {
    list.push({ id: 'completions_100', title: '100 hábitos completados' });
  }
  if (stats.totalCompletions >= ACHIEVEMENT_THRESHOLDS.completions365) {
    list.push({ id: 'completions_365', title: '365 hábitos completados' });
  }
  if (stats.scheduledToday > 0 && stats.completedToday === stats.scheduledToday) {
    list.push({ id: 'all_done_today', title: 'Tudo feito hoje' });
  }

  return list;
}