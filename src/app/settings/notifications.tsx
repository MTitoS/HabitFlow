import { StyleSheet, Text as RNText, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';
import { spacing } from '@/theme/spacing';
import {
  getPermissionStatus,
  requestPermission,
  rescheduleForHabits,
  PermissionStatus,
} from '@/services/notifications/service';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { habits } = useData();
  const [permission, setPermission] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    getPermissionStatus().then(setPermission);
  }, []);

  const withReminders = habits.filter((h) => h.reminder?.enabled && h.reminder.times.length > 0);

  const askPermission = async () => {
    const status = await requestPermission();
    setPermission(status);
    if (status === 'granted') {
      await rescheduleForHabits(withReminders, new Date());
    }
  };

  return (
    <AppScaffold title="Notificações">
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.rowText}>
            <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', color: theme.color('textPrimary'), fontSize: 16 }}>
              Permissão de notificação
            </RNText>
            <RNText style={{ color: theme.color('textMuted'), fontSize: 13 }}>
              Status: {permission === 'granted' ? 'concedida' : permission === 'denied' ? 'negada' : 'indefinida'}
            </RNText>
          </View>
          {permission !== 'granted' ? (
            <Button label="Permitir" variant="ghost" onPress={() => void askPermission()} />
          ) : null}
        </View>
      </View>

      {withReminders.length === 0 ? (
        <EmptyState kind="no-stats" />
      ) : (
        <View style={styles.list}>
          <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>
            Hábitos com lembrete
          </RNText>
          {withReminders.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <RNText style={{ color: theme.color('textPrimary'), flex: 1 }}>{habit.name}</RNText>
              <RNText style={{ color: theme.color('textSecondary') }}>
                {habit.reminder?.times.join(' · ')}
              </RNText>
            </View>
          ))}
        </View>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  list: {
    gap: spacing.md,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});