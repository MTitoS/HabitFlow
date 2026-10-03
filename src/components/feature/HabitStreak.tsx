import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';

export function HabitStreak({ days }: { days: number }) {
  const theme = useTheme();
  if (days <= 0) return null;
  return (
    <View style={styles.row}>
      <RNText style={styles.emoji}>🔥</RNText>
      <RNText style={[styles.label, { color: theme.color('textMuted') }]}>
        {days} {days === 1 ? 'dia' : 'dias'}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
});