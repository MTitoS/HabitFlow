import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { AddHabitButton } from '@/components/feature/AddHabitButton';
import { HabitCard } from '@/components/feature/HabitCard';
import { EmptyState } from '@/components/feature/EmptyState';
import { MetricTabSelector } from '@/components/feature/MetricTabSelector';
import { computeStreaks } from '@/domain/streak/currentStreak';
import { completionRate } from '@/domain/stats/completionRate';
import { scheduledKeysInRange } from '@/domain/habit/isScheduled';
import { addDays, daysInMonth, monthStartOf, todayKey } from '@/domain/date/dateUtils';
import { HabitRecord } from '@/domain/record/model';

export default function HabitsScreen() {
  const { habits, records } = useData();
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const now = new Date();
  const filtered = habits.filter((h) => (tab === 'active' ? !h.archivedAt : Boolean(h.archivedAt)));
  const monthStart = monthStartOf(todayKey(now));
  const monthEnd = addDays(monthStart, daysInMonth(Number(monthStart.slice(0, 4)), Number(monthStart.slice(5, 7)) - 1) - 1);

  return (
    <AppScaffold title="Hábitos" actions={<AddHabitButton />}>
      <MetricTabSelector active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState
          kind={tab === 'active' ? 'no-habits' : 'no-stats'}
          onAction={tab === 'active' ? () => router.push('/habits/create') : undefined}
        />
      ) : (
        <View style={styles.grid}>
          {filtered.map((habit) => {
            const habitRecords = recordsOf(records, habit.id);
            const { current, best } = computeStreaks(habit, habitRecords, now);
            const monthDates = scheduledKeysInRange(habit, monthStart, monthEnd);
            const rate = completionRate(habitRecords, monthDates);
            void best;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={current}
                percent={rate}
                onPress={() => router.push(`/habits/${habit.id}`)}
              />
            );
          })}
        </View>
      )}
    </AppScaffold>
  );
}

function recordsOf(records: HabitRecord[], habitId: string): HabitRecord[] {
  return records.filter((r) => r.habitId === habitId);
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
});