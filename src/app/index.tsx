import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { AddHabitButton } from '@/components/feature/AddHabitButton';
import { TodayProgress } from '@/components/feature/TodayProgress';
import { HabitRow } from '@/components/feature/HabitRow';
import { EmptyState, ErrorState } from '@/components/feature/EmptyState';
import { todayKey } from '@/domain/date/dateUtils';
import { groupHabitsByRoutine, scheduledForDay } from '@/domain/routine/group';
import { statusForView } from '@/domain/stats/materializeMissed';
import { triggerSuccess } from '@/services/haptics';
import { isOnboardingDone } from '@/services/prefs';
import { useEffect, useState } from 'react';
import { Habit } from '@/domain/habit/model';

export default function TodayScreen() {
  return <TodayBody />;
}

function TodayBody() {
  const theme = useTheme();
  const { habits, records, routines, skipCredit, loading, error, repos, reload } = useData();
  const { showToast } = useToast();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const today = todayKey(new Date());

  useEffect(() => {
    isOnboardingDone().then(setOnboardingDone);
  }, []);

  if (onboardingDone === false) {
    return <Redirect href="/onboarding" />;
  }

  if (loading && onboardingDone === null) {
    return (
      <AppScaffold title="Hoje">
        <ActivityIndicator color={theme.color('primary')} />
      </AppScaffold>
    );
  }

  if (error) {
    return (
      <AppScaffold title="Hoje">
        <ErrorState message={error.message} onRetry={() => void reload()} />
      </AppScaffold>
    );
  }

  const active = habits.filter((h) => !h.archivedAt);
  const scheduledToday = scheduledForDay(active, today);

  const completedToday = records.filter(
    (r) => r.date === today && r.status === 'completed',
  ).length;
  const totalToday = scheduledToday.length;
  const percent = totalToday > 0 ? completedToday / totalToday : 0;

  const completeHabit = async (habit: Habit) => {
    const now = new Date();
    try {
      await repos.records.setCompleted(habit.id, todayKey(now), now);
      await triggerSuccess();
      showToast('success', `${habit.name} concluído`);
    } catch {
      showToast('error', 'Não foi possível completar agora');
    }
  };

  const groups = groupHabitsByRoutine(scheduledToday, routines).map((group) => ({
    ...group,
    habits: group.habitIds
      .map((id) => scheduledToday.find((h) => h.id === id))
      .filter((h): h is Habit => Boolean(h)),
  }));

  return (
    <AppScaffold title="Hoje">
      <View style={styles.focus}>
        <TodayProgress completed={completedToday} total={totalToday} percent={percent} />
      </View>

      {scheduledToday.length === 0 ? (
        <EmptyState
          kind={habits.length === 0 ? 'no-habits' : 'nothing-today'}
          onAction={habits.length === 0 ? () => undefined : undefined}
        />
      ) : (
        groups.map((group, index) => (
          <View key={group.routine?.id ?? `none-${index}`} style={styles.group}>
            {group.routine ? (
              <RNText style={[styles.groupTitle, { color: theme.color('textMuted') }]}>
                {group.routine.name}
              </RNText>
            ) : null}
            <View style={styles.list}>
              {group.habits.map((habit) => {
                const record = records.find((r) => r.habitId === habit.id && r.date === today);
                const state =
                  record?.status === 'completed'
                    ? 'completed'
                    : record?.status === 'skipped'
                      ? 'skipped'
                      : (statusForView(habit, records, today, new Date()) ?? 'pending');
                return (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    state={state}
                    onToggle={() => void completeHabit(habit)}
                  />
                );
              })}
            </View>
          </View>
        ))
      )}

      <View style={styles.creditRow}>
        <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>
          Créditos de pulo: {skipCredit ? skipCredit.balance : 0}/3
        </RNText>
      </View>

      <AddHabitButton />
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  focus: {
    marginBottom: 4,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 10,
  },
  creditRow: {
    alignItems: 'center',
  },
});