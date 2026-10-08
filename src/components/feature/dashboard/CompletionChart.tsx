import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { ColorToken } from '@/theme/types';
import { DayPoint } from '@/domain/stats/aggregate';
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

export function CompletionChart({ series, title = 'Progresso mensal' }: Props) {
  const theme = useTheme();
  const maxScheduled = Math.max(...series.map((p) => p.scheduled), 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>{title}</RNText>
      <View style={styles.row}>
        {series.map((point) => {
          const pct = Math.round(point.percent * 100);
          const hasData = point.scheduled > 0 && maxScheduled > 0;
          const ordered = segmentsOf(point).reverse();
          return (
            <View
              key={point.dateKey}
              style={styles.barWrap}
              accessibilityLabel={`Dia ${point.monthDay}: ${point.done} concluídos, ${point.skipped} skipados, ${point.undone} não concluídos (${pct}%)`}
            >
              <View style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
                {hasData &&
                  ordered.map((segment, index) => (
                    <View
                      key={segment.token}
                      style={[
                        styles.segment,
                        index > 0 && { borderTopWidth: 1, borderTopColor: theme.color('surface') },
                        {
                          height: `${(segment.count / maxScheduled) * 100}%`,
                          backgroundColor: theme.color(segment.token),
                        },
                      ]}
                    />
                  ))}
              </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  barWrap: {
    flex: 1,
    height: 64,
    justifyContent: 'flex-end',
  },
  track: {
    height: '100%',
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  segment: {
    width: '100%',
  },
});
