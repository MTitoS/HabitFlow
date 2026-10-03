import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { DayPoint } from '@/domain/stats/aggregate';
import { weekdayOf, WEEKDAY_LABELS } from '@/domain/date/dateUtils';

interface Props {
  series: DayPoint[];
  title?: string;
}

export function WeeklyChart({ series, title = 'Esta semana' }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>{title}</RNText>
      <View style={styles.chart}>
        {series.map((point) => {
          const label = WEEKDAY_LABELS[weekdayOf(point.dateKey)];
          const pct = Math.round(point.percent * 100);
          const hasData = point.scheduled > 0;
          return (
            <View key={point.dateKey} style={styles.barCol} accessibilityLabel={`${label}: ${pct}%`}>
              <RNText style={{ color: theme.color('textMuted'), fontSize: 11 }}>{pct}%</RNText>
              <View style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: hasData ? `${Math.max(4, pct)}%` : '4%',
                      backgroundColor: theme.color('primary'),
                    },
                  ]}
                />
              </View>
              <RNText style={{ color: theme.color('textMuted'), fontSize: 11 }}>{label}</RNText>
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
  bar: {
    width: '100%',
    borderRadius: radius.sm,
  },
});