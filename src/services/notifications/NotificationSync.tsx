import { useEffect } from 'react';
import { useData } from '@/data/DataProvider';
import { rescheduleForHabits } from '@/services/notifications/service';
import { Habit } from '@/domain/habit/model';

function hasAnyReminders(habits: Habit[]): boolean {
  return habits.some((h) => h.reminder?.enabled && h.reminder.times.length > 0);
}

export function NotificationSync() {
  const { habits } = useData();

  useEffect(() => {
    if (hasAnyReminders(habits)) {
      void rescheduleForHabits(habits, new Date());
    }
  }, [habits]);

  return null;
}