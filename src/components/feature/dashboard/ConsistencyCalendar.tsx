import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme, AppTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { DayPoint } from '@/domain/stats/aggregate';
import { toDateKey } from '@/domain/date/dateUtils';

function dayStyle(point: DayPoint, theme: AppTheme): { bg: string; fg: string; symbol: string } {
  if (point.scheduled === 0) {
    return { bg: 'transparent', fg: theme.color('textMuted'), symbol: '' };
  }
  if (point.completed === point.scheduled) {
    return { bg: theme.color('calendarDoneFill'), fg: theme.color('calendarDoneFg'), symbol: '✓' };
  }
  if (point.completed > 0) {
    return { bg: theme.color('calendarSkipFill'), fg: theme.color('calendarSkipFg'), symbol: '◐' };
  }
  return { bg: theme.color('surfaceElevated'), fg: theme.color('textPrimary'), symbol: '○' };
}

interface Props {
  monthKey: string;
  series: DayPoint[];
}

export function ConsistencyCalendar({ monthKey: month, series }: Props) {
  const theme = useTheme();
  const byDate = new Map(series.map((p) => [p.dateKey, p]));
  const firstDay = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
  const leading = firstDay.getDay();
  const today = toDateKey(new Date());

  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`),
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <View style={styles.weekRow}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => (
          <RNText key={label} style={[styles.weekLabel, { color: theme.color('textMuted') }]}>
            {label}
          </RNText>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((dateKey, index) => {
          if (!dateKey) {
            return <View key={`pad-${index}`} style={styles.cell} />;
          }
          const point = byDate.get(dateKey);
          if (!point) {
            return <View key={dateKey} style={styles.cell} />;
          }
          const meta = dayStyle(point, theme);
          const isToday = dateKey === today;
return (
              <View
                key={dateKey}
                accessibilityLabel={`${dateKey}: ${point.completed}/${point.scheduled} concluído`}
                style={[
                  styles.cell,
                  isToday && { borderWidth: 1, borderColor: theme.color('calendarTodayRing'), borderRadius: radius.sm },
                ]}
              >
              <View style={[styles.day, { backgroundColor: meta.bg }]}>
                <RNText style={{ color: meta.fg, fontSize: 12, fontWeight: '600' }}>
                  {meta.symbol || Number(dateKey.slice(8))}
                </RNText>
              </View>
            </View>
          );
        })}
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
});