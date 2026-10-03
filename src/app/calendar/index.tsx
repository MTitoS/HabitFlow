import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';
import { monthlySeries } from '@/domain/stats/aggregate';
import { monthKey, todayKey } from '@/domain/date/dateUtils';
import { statusForView } from '@/domain/stats/materializeMissed';

function shiftMonth(current: string, delta: number): string {
  const [y, m] = current.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const theme = useTheme();
  const { habits, records } = useData();
  const [month, setMonth] = useState(monthKey(todayKey(new Date())));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const now = new Date();
  const series = monthlySeries(habits.filter((h) => !h.archivedAt), records, now);
  const today = todayKey(now);

  const byDate = new Map(series.map((p) => [p.dateKey, p]));
  const firstDay = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
  const leading = firstDay.getDay();

  const dayStatus = (dateKey: string) => {
    const active = habits.filter((h) => !h.archivedAt);
    const row: { habitName: string; symbol: string; color: string }[] = [];
    for (const habit of active) {
      const status = statusForView(habit, records, dateKey, now);
      const symbol = status === 'completed' ? '✓' : status === 'skipped' ? '—' : status === 'missed' ? '✕' : '○';
      const color =
        status === 'completed'
          ? theme.color('success')
          : status === 'skipped'
            ? theme.color('accent')
            : status === 'missed'
              ? theme.color('danger')
              : theme.color('textMuted');
      if (status) row.push({ habitName: habit.name, symbol, color });
    }
    return row;
  };

  const monthLabel = month;

  return (
    <AppScaffold
      title="Calendário"
      actions={
        <Pressable accessibilityRole="button" onPress={() => setMonth(monthKey(today))}>
          <RNText style={{ color: theme.color('primary'), fontWeight: '600' }}>Hoje</RNText>
        </Pressable>
      }
    >
      <View style={styles.monthNav}>
        <Button label="‹" variant="ghost" onPress={() => setMonth(shiftMonth(month, -1))} />
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: theme.color('textPrimary') }}>
          {monthLabel}
        </RNText>
        <Button label="›" variant="ghost" onPress={() => setMonth(shiftMonth(month, 1))} />
      </View>

      <MonthGrid
        month={month}
        daysInMonth={daysInMonth}
        leading={leading}
        byDate={byDate}
        today={today}
        onSelect={(dateKey) => setSelectedDay(dateKey)}
      />

      {selectedDay ? (
        <View style={[styles.dayCard, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
          <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', color: theme.color('textPrimary') }}>
            {selectedDay}
          </RNText>
          {dayStatus(selectedDay).length === 0 ? (
            <RNText style={{ color: theme.color('textMuted') }}>Nenhum hábito programado.</RNText>
          ) : (
            dayStatus(selectedDay).map((row, i) => (
              <View key={i} style={styles.statusRow}>
                <RNText style={{ color: row.color }}>{row.symbol}</RNText>
                <RNText style={{ color: theme.color('textPrimary'), flex: 1 }}>{row.habitName}</RNText>
              </View>
            ))
          )}
          <Pressable accessibilityRole="button" onPress={() => setSelectedDay(null)}>
            <RNText style={{ color: theme.color('primary') }}>Fechar detalhe</RNText>
          </Pressable>
        </View>
      ) : null}

      {habits.length === 0 ? <EmptyState kind="no-habits" /> : null}
    </AppScaffold>
  );
}

function MonthGrid({
  month,
  daysInMonth,
  leading,
  byDate,
  today,
  onSelect,
}: {
  month: string;
  daysInMonth: number;
  leading: number;
  byDate: Map<string, { dateKey: string; scheduled: number; completed: number; percent: number; monthDay: number; weekday: string }>;
  today: string;
  onSelect: (dateKey: string) => void;
}) {
  const theme = useTheme();
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ];

  return (
    <View style={styles.monthGrid}>
      <View style={styles.weekRow}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, i) => (
          <RNText key={`w-${i}`} style={[styles.weekLabel, { color: theme.color('textMuted') }]}>
            {label}
          </RNText>
        ))}
      </View>
      {cells.map((dateKey, index) => {
        if (!dateKey) return <View key={index} style={styles.cell} />;
        const point = byDate.get(dateKey);
        const symbol =
          point && point.scheduled > 0
            ? point.completed === point.scheduled
              ? '✓'
              : point.completed > 0
                ? '◐'
                : '○'
            : '';
        const bg =
          point && point.scheduled > 0
            ? point.completed === point.scheduled
              ? theme.color('success')
              : point.completed > 0
                ? theme.color('accent')
                : theme.color('surfaceElevated')
            : 'transparent';
        const fg =
          point && point.scheduled > 0
            ? point.completed > 0
              ? '#fff'
              : theme.color('textPrimary')
            : theme.color('textMuted');
        const isToday = dateKey === today;
        return (
          <Pressable
            key={dateKey}
            accessibilityRole="button"
            accessibilityLabel={`${dateKey}${point && point.scheduled > 0 ? `: ${point.completed}/${point.scheduled}` : ''}`}
            onPress={() => onSelect(dateKey)}
            style={[styles.cell, isToday && { borderWidth: 1, borderColor: theme.color('primary'), borderRadius: 8 }]}
          >
            <View style={[styles.day, { backgroundColor: bg }]}>
              <RNText style={{ color: fg, fontSize: 12, fontWeight: '600' }}>
                {symbol || Number(dateKey.slice(8))}
              </RNText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCard: {
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});