import { scheduleForHabit, getPermissionStatus, requestPermission, cancelAllScheduled, rescheduleForHabits } from '@/services/notifications/service';
import { Habit } from '@/domain/habit/model';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: jest.fn(async () => ({ granted: false, canAskAgain: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(async () => ({ data: 'id' })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
}));

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    icon: 'book',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    reminder: { enabled: true, times: ['08:00'] },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('NotificationService', () => {
  const now = new Date(2026, 4, 6, 7, 0, 0);

  it('getPermissionStatus maps not granted to undetermined/denied', async () => {
    const status = await getPermissionStatus();
    expect(['undetermined', 'denied']).toContain(status);
  });

  it('requestPermission returns granted from mock', async () => {
    expect(await requestPermission()).toBe('granted');
  });

  it('scheduleForHabit calls expo-notifications once per future reminder', async () => {
    const Notifications = jest.requireMock('expo-notifications');
    await scheduleForHabit(habit(), '2026-05-06', now);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('cancelAllScheduled clears pending notifications', async () => {
    const Notifications = jest.requireMock('expo-notifications');
    await cancelAllScheduled();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });

  it('rescheduleForHabits cancels then schedules for enabled habits', async () => {
    jest.clearAllMocks();
    await rescheduleForHabits([habit()], now);
    const Notifications = jest.requireMock('expo-notifications');
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });
});