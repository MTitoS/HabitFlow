import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { ViewStatus } from '@/domain/stats/materializeMissed';

export interface WeekStatusDay {
  key: string;
  status: ViewStatus;
}

interface Props {
  days: WeekStatusDay[];
  isRetroEligible: (key: string) => boolean;
  onRetroComplete: (key: string) => void;
  accessibilityLabelFor?: (key: string) => string;
}

export function WeekStatusRow({
  days,
  isRetroEligible,
  onRetroComplete,
  accessibilityLabelFor,
}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.weekRow}>
      {days.map(({ key, status }) => {
        const symbol =
          status === 'completed'
            ? '✓'
            : status === 'skipped'
              ? '—'
              : status === 'missed'
                ? '✕'
                : '○';
        const tokenColor =
          status === 'completed'
            ? theme.color('successBright')
            : status === 'skipped'
              ? theme.color('accent')
              : status === 'missed'
                ? theme.color('dangerBright')
                : theme.color('textMuted');
        const label = accessibilityLabelFor?.(key);
        const content = (
          <>
            <RNText style={{ color: tokenColor, fontSize: 16 }}>{symbol}</RNText>
            <RNText style={{ color: theme.color('textMuted'), fontSize: 10 }}>{key.slice(8)}</RNText>
          </>
        );

        if (isRetroEligible(key)) {
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onRetroComplete(key)}
              style={styles.weekCell}
            >
              {content}
            </Pressable>
          );
        }

        return (
          <View key={key} accessibilityRole="text" accessibilityLabel={label} style={styles.weekCell}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCell: {
    alignItems: 'center',
    gap: 4,
  },
});
