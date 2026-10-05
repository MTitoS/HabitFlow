import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme, AppTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { Icon } from '@/components/ui/Icon';
import { DayPoint } from '@/domain/stats/aggregate';
import { MonthDayState } from '@/domain/streak/overallStreak';
import { buildMonthGrid } from '@/domain/date/monthGrid';

const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function stateMeta(state: MonthDayState, theme: AppTheme): { bg: string; fg: string; symbol: string; label: string } {
  switch (state) {
    case 'conquered':
      return { bg: theme.color('calendarDoneFill'), fg: theme.color('calendarDoneFg'), symbol: '✓', label: 'Vencido' };
    case 'partial':
      return { bg: theme.color('calendarSkipFill'), fg: theme.color('calendarSkipFg'), symbol: '◐', label: 'Parcial' };
    default:
      return { bg: theme.color('surfaceElevated'), fg: theme.color('textMuted'), symbol: '○', label: 'Neutro' };
  }
}

interface Props {
  series: DayPoint[];
  statuses: { dateKey: string; state: MonthDayState }[];
  streakCurrent: number;
}

export function MonthView({ series, statuses, streakCurrent }: Props) {
  const theme = useTheme();
  const statusByDate = new Map(statuses.map((s) => [s.dateKey, s.state]));

  const first = series[0]?.dateKey ?? '';
  const year = Number(first.slice(0, 4));
  const monthIndex = Number(first.slice(5, 7)) - 1;
  const grid = first ? buildMonthGrid(year, monthIndex, 1) : [];

  const conqueredDays = statuses.filter((s) => s.state === 'conquered').length;
  const scheduled = series.reduce((acc, p) => acc + p.scheduled, 0);
  const completed = series.reduce((acc, p) => acc + p.completed, 0);
  const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>Mês</RNText>

      <View
        style={styles.headline}
        accessibilityLabel={`Sequência geral: ${streakCurrent} dias vencidos`}
      >
        <Icon name="fire" size={22} color="accent" />
        <RNText style={[styles.headlineValue, { color: theme.color('textPrimary') }]}>
          {streakCurrent}
        </RNText>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>dias vencidos seguidos</RNText>
      </View>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label) => (
          <RNText key={label} style={[styles.weekLabel, { color: theme.color('textMuted') }]}>
            {label}
          </RNText>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.flat().map((dateKey, index) => {
          if (!dateKey) return <View key={`pad-${index}`} style={styles.cell} />;
          const state = statusByDate.get(dateKey) ?? 'neutral';
          const meta = stateMeta(state, theme);
          return (
            <View key={dateKey} style={styles.cell}>
              <View
                accessibilityLabel={`${dateKey}: ${meta.label}`}
                style={[styles.day, { backgroundColor: meta.bg }]}
              >
                <RNText style={{ color: meta.fg, fontSize: 11, fontWeight: '600' }}>{meta.symbol}</RNText>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        {(['conquered', 'partial', 'neutral'] as MonthDayState[]).map((state) => {
          const meta = stateMeta(state, theme);
          return (
            <View key={state} style={styles.legendItem}>
              <RNText style={{ color: meta.fg, fontSize: 12, fontWeight: '600' }}>{meta.symbol}</RNText>
              <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>{meta.label}</RNText>
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          {conqueredDays} {conqueredDays === 1 ? 'dia vencido' : 'dias vencidos'}
        </RNText>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>{rate}% no mês</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headlineValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 22,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
