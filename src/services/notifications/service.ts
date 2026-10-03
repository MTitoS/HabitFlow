import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '@/domain/habit/model';
import { remindersForDay } from '@/services/notifications/policy';
import { todayKey } from '@/domain/date/dateUtils';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === 'web') return 'denied';
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted ? 'granted' : settings.canAskAgain ? 'undetermined' : 'denied';
}

export async function requestPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'web') return 'denied';
  const settings = await Notifications.requestPermissionsAsync();
  return settings.granted ? 'granted' : 'denied';
}

export async function cancelAllScheduled(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

function dateAtTime(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export async function scheduleForHabit(habit: Habit, dateKey: string, now: Date): Promise<void> {
  if (Platform.OS === 'web') return;

  const jobs = remindersForDay(habit, dateKey, now);

  for (const job of jobs) {
    const trigger = dateAtTime(job.dateKey, job.time);
    if (trigger.getTime() <= now.getTime()) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: job.habitName,
          body: 'Hora de completar este hábito.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });
    } catch {
      // individual scheduling failure should not crash the loop
    }
  }
}

export async function rescheduleForHabits(habits: Habit[], now: Date): Promise<void> {
  if (Platform.OS === 'web') return;
  await cancelAllScheduled();
  const today = todayKey(now);
  for (const habit of habits) {
    if (habit.reminder?.enabled) {
      await scheduleForHabit(habit, today, now);
    }
  }
}