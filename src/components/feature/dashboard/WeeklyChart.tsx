import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { ColorToken } from '@/theme/types';
import { DayPoint } from '@/domain/stats/aggregate';
import { weekdayOf, WEEKDAY_LABELS } from '@/domain/date/dateUtils';
import { ChartLegend } from '@/components/feature/dashboard/ChartLegend';

interface Props {
  series: DayPoint[];
  title?: string;
}

function segmentsOf(point: DayPoint): { token: ColorToken; count: number }[] {
  const segments: { token: ColorToken; count: number }[] = [
    { token: 'chartDone', count: point.done },
    { token: 'chartSkip', count: point.skipped },
    { token: 'chartUndone', count: point.undone },
  ];
  return segments.filter((segment) => segment.count > 0);
}

export function WeeklyChart({ series, title = 'Esta semana' }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>{title}</RNText>
      <View style={styles.chart}>
        {series.map((point) => {
          const label = WEEKDAY_LABELS[weekdayOf(point.dateKey)];
          const pct = point.scheduled > 0 ? Math.round((point.done / point.scheduled) * 100) : 0;
          const hasData = point.scheduled > 0;
          const ordered = segmentsOf(point).reverse();
          return (
            <View
              key={point.dateKey}
              style={styles.barCol}
              accessibilityLabel={`${label}: ${point.done} concluídos, ${point.skipped} skipados, ${point.undone} não concluídos (${pct}%)`}
            >
              <RNText style={{ color: theme.color('textMuted'), fontSize: 11 }}>{pct}%</RNText>
              <View style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
                {hasData &&
                  ordered.map((segment, index) => (
                    <View
                      key={segment.token}
                      testID={`wk-seg-${point.dateKey}-${segment.token}`}
                      style={[
                        styles.segment,
                        index > 0 && { borderTopWidth: 1, borderTopColor: theme.color('surface') },
                        {
                          height: `${(segment.count / point.scheduled) * 100}%`,
                          backgroundColor: theme.color(segment.token),
                        },
                      ]}
                    />
                  ))}
              </View>
              <RNText style={{ color: theme.color('textMuted'), fontSize: 11 }}>{label}</RNText>
            </View>
          );
        })}
      </View>
      <ChartLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  track: {
    height: 96,
    width: 20,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  segment: {
    width: '100%',
  },
});
