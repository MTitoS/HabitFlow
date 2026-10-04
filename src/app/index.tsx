import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { TodayProgress } from '@/components/feature/TodayProgress';
import { HabitRow } from '@/components/feature/HabitRow';
import { CheckboxState } from '@/components/feature/HabitCheckbox';
import { EmptyState, ErrorState } from '@/components/feature/EmptyState';
import { todayKey } from '@/domain/date/dateUtils';
import { groupHabitsByRoutine, scheduledForDay } from '@/domain/routine/group';
import { sortByTime } from '@/domain/routine/order';
import { statusForView } from '@/domain/stats/materializeMissed';
import { useSkip as applySkip } from '@/domain/skip-credit/useSkip';
import { triggerSuccess } from '@/services/haptics';
import { isOnboardingDone } from '@/services/prefs';
import { useEffect, useState } from 'react';
import { Habit } from '@/domain/habit/model';
import { computeAchievements } from '@/hooks/useAchievements';
import { DerivedStats } from '@/domain/stats/achievements';
import { daySummary } from '@/domain/stats/aggregate';
import { MilestoneCelebration } from '@/components/feature/MilestoneCelebration';
import { CelebrationOverlay } from '@/components/feature/CelebrationOverlay';
import { HabitRecord } from '@/domain/record/model';

function buildDerivedStats(habits: Habit[], records: HabitRecord[], now: Date): DerivedStats {
  const summary = daySummary(habits, records, now);
  const totalCompletions = records.filter((r) => r.status === 'completed').length;
  return {
    currentStreak: summary.overallCurrentStreak,
    bestStreak: summary.overallBestStreak,
    totalCompletions,
    scheduledToday: summary.scheduledToday,
    completedToday: summary.completedToday,
  };
}

export default function TodayScreen() {
  return <TodayBody />;
}

function TodayBody() {
  const theme = useTheme();
  const { habits, records, routines, skipCredit, loading, error, repos, reload } = useData();
  const { showToast } = useToast();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [celebration, setCelebration] = useState<
    { kind: 'milestone'; titles: string[] } | { kind: 'all-done' } | null
  >(null);
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

  const toggleHabit = async (habit: Habit, currentState: CheckboxState) => {
    const now = new Date();
    try {
      if (currentState === 'completed') {
        await repos.records.setPending(habit.id, todayKey(now), now);
        await triggerSuccess();
        showToast('info', `${habit.name} marcado como não feito`);
        return;
      }
      await repos.records.setCompleted(habit.id, todayKey(now), now);
      await triggerSuccess();
      showToast('success', `${habit.name} concluído`);
      await maybeCelebrate(now);
    } catch {
      showToast('error', 'Não foi possível atualizar agora');
    }
  };

  const maybeCelebrate = async (now: Date) => {
    const activeHabits = habits.filter((h) => !h.archivedAt);
    const scheduled = scheduledForDay(activeHabits, todayKey(now));
    const doneToday = records.filter(
      (r) => r.date === todayKey(now) && r.status === 'completed',
    ).length;

    const stats = buildDerivedStats(activeHabits, records, now);
    const result = await computeAchievements(stats);
    if (result.newlyEarned.length > 0) {
      setCelebration({ kind: 'milestone', titles: result.newlyEarned.map((a) => a.title) });
    } else if (scheduled.length > 0 && doneToday === scheduled.length) {
      setCelebration({ kind: 'all-done' });
    }
  };

  const skipHabit = async (habit: Habit) => {
    if (!skipCredit) return;
    const now = new Date();
    const result = applySkip(skipCredit, now, habit.id, todayKey(now));
    if (!result.ok) {
      showToast('error', 'Sem créditos de pulo');
      return;
    }
    await repos.skipCredit.save(result.state);
    await repos.records.setSkipped(habit.id, todayKey(now), now);
    showToast('skip', `${habit.name} pulado (crédito ${result.state.balance} restante)`);
  };

  const groups = groupHabitsByRoutine(scheduledToday, routines).map((group) => ({
    ...group,
    habits: sortByTime(
      group.habitIds
        .map((id) => scheduledToday.find((h) => h.id === id))
        .filter((h): h is Habit => Boolean(h)),
    ),
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
                    skipDisabled={!skipCredit || skipCredit.balance === 0}
                    onToggle={
                      state === 'pending' || state === 'completed'
                        ? () => void toggleHabit(habit, state)
                        : undefined
                    }
                    onSkip={state === 'pending' ? () => void skipHabit(habit) : undefined}
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

      <MilestoneCelebration
        visible={celebration?.kind === 'milestone'}
        titles={celebration?.kind === 'milestone' ? celebration.titles : []}
        onClose={() => setCelebration(null)}
      />
      <CelebrationOverlay
        visible={celebration?.kind === 'all-done'}
        onClose={() => setCelebration(null)}
      />
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