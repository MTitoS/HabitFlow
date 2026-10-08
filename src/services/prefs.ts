import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitSortMode } from '@/domain/habit/sortHabits';

type ThemeOverride = 'system' | 'light' | 'dark';

const KEYS = {
  onboarding: 'habitflow:prefs:onboarding',
  theme: 'habitflow:prefs:theme',
  defaults: 'habitflow:prefs:defaults',
  seen: 'habitflow:prefs:seen',
  habitsView: 'habitflow:prefs:habitsView',
  retroEdit: 'habitflow:prefs:retroEdit',
};

async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export async function isOnboardingDone(): Promise<boolean> {
  const value = await getItem(KEYS.onboarding);
  return value === '1';
}

export async function setOnboardingDone(): Promise<void> {
  await setItem(KEYS.onboarding, '1');
}

export async function getThemeOverride(): Promise<ThemeOverride> {
  const value = await getItem(KEYS.theme);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export async function setThemeOverride(mode: ThemeOverride): Promise<void> {
  await setItem(KEYS.theme, mode);
}

export interface HabitDefaults {
  icon: string;
  color: string;
  frequencyKind: string;
  countPerPeriod?: number;
  reminderTime?: string;
}

export async function getHabitDefaults(): Promise<HabitDefaults | null> {
  const value = await getItem(KEYS.defaults);
  if (!value) return null;
  try {
    return JSON.parse(value) as HabitDefaults;
  } catch {
    return null;
  }
}

export async function setHabitDefaults(defaults: HabitDefaults): Promise<void> {
  await setItem(KEYS.defaults, JSON.stringify(defaults));
}

export async function getSeenAchievements(): Promise<Set<string>> {
  const value = await getItem(KEYS.seen);
  if (!value) return new Set();
  try {
    return new Set(JSON.parse(value) as string[]);
  } catch {
    return new Set();
  }
}

export async function markAchievementSeen(id: string): Promise<void> {
  const seen = await getSeenAchievements();
  seen.add(id);
  await setItem(KEYS.seen, JSON.stringify([...seen]));
}

export async function clearSeenAchievements(): Promise<void> {
  await setItem(KEYS.seen, JSON.stringify([]));
}

export interface HabitsViewPrefs {
  mode: HabitSortMode;
  routineFilter: string | null;
}

export async function getHabitsViewPrefs(): Promise<HabitsViewPrefs | null> {
  const value = await getItem(KEYS.habitsView);
  if (!value) return null;
  try {
    return JSON.parse(value) as HabitsViewPrefs;
  } catch {
    return null;
  }
}

export async function setHabitsViewPrefs(prefs: HabitsViewPrefs): Promise<void> {
  await setItem(KEYS.habitsView, JSON.stringify(prefs));
}

export async function getRetroEditEnabled(): Promise<boolean> {
  const value = await getItem(KEYS.retroEdit);
  return value === '1';
}

export async function setRetroEditEnabled(enabled: boolean): Promise<void> {
  await setItem(KEYS.retroEdit, enabled ? '1' : '0');
}