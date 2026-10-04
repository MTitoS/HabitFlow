import { StyleSheet, Text as RNText, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { HabitIcon } from '@/components/feature/HabitIcon';
import { HabitStreak } from '@/components/feature/HabitStreak';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { statusForView } from '@/domain/stats/materializeMissed';
import { computeStreaks } from '@/domain/streak/currentStreak';
import { completionRate } from '@/domain/stats/completionRate';
import { scheduledKeysInRange } from '@/domain/habit/isScheduled';
import { addDays, daysInMonth, monthStartOf, todayKey } from '@/domain/date/dateUtils';
import { quantitativeStats } from '@/domain/stats/quantitative';
import { Sparkline } from '@/components/feature/habit-stats/Sparkline';
import { EmptyState } from '@/components/feature/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { ColorToken } from '@/theme/types';

export default function HabitDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, records } = useData();

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <AppScaffold title="Hábito">
        <EmptyState kind="no-habits" onAction={() => router.push('/habits')} />
      </AppScaffold>
    );
  }

  const now = new Date();
  const habitRecords = records.filter((r) => r.habitId === habit.id);
  const { current, best } = computeStreaks(habit, habitRecords, now);
  const monthStart = monthStartOf(todayKey(now));
  const monthEnd = addDays(monthStart, daysInMonth(Number(monthStart.slice(0, 4)), Number(monthStart.slice(5, 7)) - 1) - 1);
  const monthDates = scheduledKeysInRange(habit, monthStart, monthEnd);
  const rate = completionRate(habitRecords, monthDates);
  const total = records.filter((r) => r.habitId === habit.id && r.status === 'completed').length;
  const quant = habit.type === 'quantitative' ? quantitativeStats(habit, habitRecords) : null;

  const weekKeys = scheduledKeysInRange(habit, addDays(todayKey(now), -6), todayKey(now));
  const weekStatus = weekKeys.map((key) => ({
    key,
    status: statusForView(habit, habitRecords, key, now),
  }));

  return (
    <AppScaffold
      title={habit.name}
      actions={
        <Button label="Editar" variant="ghost" onPress={() => router.push(`/habits/${habit.id}/edit`)} />
      }
    >
      <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
        <HabitIcon name={habit.icon} color={habit.color} size={32} />
        <View style={styles.rowBetween}>
          <RNText style={{ color: theme.color('textPrimary'), fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>
            {habit.name}
          </RNText>
          <HabitStreak days={current} />
        </View>
        <View style={styles.metrics}>
          <Metric icon="fire" iconColor="secondary" label="Atual" value={`${current}`} />
          <Metric icon="trophy" iconColor="accent" label="Melhor" value={`${best}`} />
          <Metric icon="check" iconColor="success" label="Total" value={`${total}`} />
        </View>
        <ProgressBar progress={rate} label={`${Math.round(rate * 100)}% no mês`} />
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          {Math.round(rate * 100)}% concluído neste mês
        </RNText>
      </View>

      <View style={styles.card}>
        <RNText style={[styles.sectionTitle, { color: theme.color('textMuted') }]}>Últimos 7 dias</RNText>
        <View style={styles.weekRow}>
          {weekStatus.map(({ key, status }) => {
            const symbol =
              status === 'completed' ? '✓' : status === 'skipped' ? '—' : status === 'missed' ? '✕' : '○';
            const tokenColor =
              status === 'completed' ? theme.color('success') : status === 'skipped' ? theme.color('accent') : status === 'missed' ? theme.color('danger') : theme.color('textMuted');
            return (
              <View key={key} style={styles.weekCell}>
                <RNText style={{ color: tokenColor, fontSize: 16 }}>{symbol}</RNText>
                <RNText style={{ color: theme.color('textMuted'), fontSize: 10 }}>
                  {key.slice(8)}
                </RNText>
              </View>
            );
          })}
        </View>
      </View>

      {quant ? (
        <View style={styles.card}>
          <RNText style={[styles.sectionTitle, { color: theme.color('textMuted') }]}>Quantitativo</RNText>
          <View style={styles.metrics}>
            <Metric icon="chart" iconColor="secondary" label="Média" value={`${quant.averagePerCompleted.toFixed(1)} ${quant.unit}`} />
            <Metric icon="check" iconColor="success" label="Total" value={`${quant.total} ${quant.unit}`} />
            <Metric icon="target" iconColor="accent" label="Meta batida" value={`${quant.daysGoalMet}/${quant.daysCompleted}`} />
          </View>
          <Sparkline values={quant.series.map((point) => point.value)} max={habit.targetValue} />
        </View>
      ) : null}
    </AppScaffold>
  );
}

function Metric({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: ColorToken;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <View>
      <RNText style={{ color: theme.color('textPrimary'), fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>
        {value}
      </RNText>
      <View style={styles.metricLabel}>
        <Icon name={icon} size={12} color={iconColor} />
        <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>{label}</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metrics: {
    flexDirection: 'row',
    gap: 24,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCell: {
    alignItems: 'center',
    gap: 4,
  },
});