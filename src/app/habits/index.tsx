import { StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { AddHabitButton } from '@/components/feature/AddHabitButton';
import { HabitCard } from '@/components/feature/HabitCard';
import { EmptyState } from '@/components/feature/EmptyState';
import { MetricTabSelector } from '@/components/feature/MetricTabSelector';
import { HabitsToolbar, NO_ROUTINE_FILTER } from '@/components/feature/HabitsToolbar';
import { computeStreaks } from '@/domain/streak/currentStreak';
import { completionRate } from '@/domain/stats/completionRate';
import { scheduledKeysInRange } from '@/domain/habit/isScheduled';
import { filterHabitsByName, HabitSortMode, sortHabits } from '@/domain/habit/sortHabits';
import { addDays, daysInMonth, monthStartOf, todayKey } from '@/domain/date/dateUtils';
import { Habit, Routine } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { getHabitsViewPrefs, setHabitsViewPrefs } from '@/services/prefs';
import { useBreakpoint } from '@/utils/useBreakpoint';

export default function HabitsScreen() {
  const { habits, records, routines } = useData();
  const theme = useTheme();
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<HabitSortMode>('added');
  const [routineFilter, setRoutineFilter] = useState<string | null>(null);
  const isDesktop = useBreakpoint() === 'desktop';
  const now = new Date();
  const monthStart = monthStartOf(todayKey(now));
  const monthEnd = addDays(monthStart, daysInMonth(Number(monthStart.slice(0, 4)), Number(monthStart.slice(5, 7)) - 1) - 1);

  useEffect(() => {
    let cancelled = false;
    void getHabitsViewPrefs().then((prefs) => {
      if (cancelled || !prefs) return;
      setSortMode(prefs.mode);
      setRoutineFilter(prefs.routineFilter);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeSortMode = (mode: HabitSortMode) => {
    setSortMode(mode);
    void setHabitsViewPrefs({ mode, routineFilter });
  };

  const changeRoutineFilter = (routineId: string | null) => {
    setRoutineFilter(routineId);
    void setHabitsViewPrefs({ mode: sortMode, routineFilter: routineId });
  };

  const base = habits.filter((h) => (tab === 'active' ? !h.archivedAt : Boolean(h.archivedAt)));
  const searched = filterHabitsByName(base, query);
  const routineFiltered = routineFilter
    ? searched.filter((h) =>
        routineFilter === NO_ROUTINE_FILTER ? !h.routineId : h.routineId === routineFilter,
      )
    : searched;
  const sorted = sortHabits(routineFiltered, sortMode);
  const hasFilter = query.trim().length > 0 || routineFilter !== null;

  const groups =
    sortMode === 'routine'
      ? groupForRender(sorted, routines)
      : [{ key: 'all', label: null as string | null, habits: sorted }];

  const renderCard = (habit: Habit) => {
    const habitRecords = recordsOf(records, habit.id);
    const { current } = computeStreaks(habit, habitRecords, now);
    const monthDates = scheduledKeysInRange(habit, monthStart, monthEnd);
    const rate = completionRate(habitRecords, monthDates);
    return (
      <HabitCard
        key={habit.id}
        habit={habit}
        streak={current}
        percent={rate}
        onPress={() => router.push(`/habits/${habit.id}`)}
      />
    );
  };

  return (
    <AppScaffold title="Hábitos" actions={isDesktop ? <AddHabitButton /> : undefined}>
      <MetricTabSelector active={tab} onChange={setTab} />

      {base.length > 0 ? (
        <HabitsToolbar
          query={query}
          onQueryChange={setQuery}
          sortMode={sortMode}
          onSortModeChange={changeSortMode}
          routineFilter={routineFilter}
          onRoutineFilterChange={changeRoutineFilter}
          routines={routines}
        />
      ) : null}

      {base.length === 0 ? (
        <EmptyState
          kind={tab === 'active' ? 'no-habits' : 'no-stats'}
          onAction={tab === 'active' ? () => router.push('/habits/create') : undefined}
        />
      ) : sorted.length === 0 && hasFilter ? (
        <EmptyState kind="no-results" />
      ) : (
        groups.map((group) => (
          <View key={group.key} style={styles.group}>
            {group.label ? (
              <RNText style={[styles.groupTitle, { color: theme.color('textMuted') }]}>
                {group.label}
              </RNText>
            ) : null}
            <View style={styles.grid}>
              {group.habits.map(renderCard)}
            </View>
          </View>
        ))
      )}

      {!isDesktop ? <AddHabitButton /> : null}
    </AppScaffold>
  );
}

function groupForRender(
  habits: Habit[],
  routines: Routine[],
): { key: string; label: string | null; habits: Habit[] }[] {
  const nameById = new Map(routines.map((r) => [r.id, r.name]));
  const groups: { key: string; label: string | null; habits: Habit[] }[] = [];

  for (const habit of habits) {
    const key = habit.routineId ?? '__none__';
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      const label = habit.routineId ? nameById.get(habit.routineId) ?? 'Sem rotina' : 'Sem rotina';
      group = { key, label, habits: [] };
      groups.push(group);
    }
    group.habits.push(habit);
  }

  return groups;
}

function recordsOf(records: HabitRecord[], habitId: string): HabitRecord[] {
  return records.filter((r) => r.habitId === habitId);
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  groupTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    gap: 12,
  },
});
