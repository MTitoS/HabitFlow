import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { DayPoint } from '@/domain/stats/aggregate';

interface Props {
  series: DayPoint[];
  title?: string;
}

export function CompletionChart({ series, title = 'Progresso mensal' }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>{title}</RNText>
      <View style={styles.row}>
        {series.map((point) => {
          const pct = Math.round(point.percent * 100);
          return (
            <View key={point.dateKey} style={styles.barWrap} accessibilityLabel={`Dia ${point.monthDay}: ${pct}%`}>
              <View style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: pct > 0 ? `${pct}%` : '2%',
                      backgroundColor: point.completed > 0 ? theme.color('accent') : theme.color('border'),
                    },
                  ]}
                />
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
  },
  bar: {
    width: '100%',
    minHeight: 2,
    borderRadius: radius.sm,
  },
});
