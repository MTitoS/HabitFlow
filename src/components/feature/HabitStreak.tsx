import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/components/ui/Icon';

export function HabitStreak({ days }: { days: number }) {
  const theme = useTheme();
  if (days <= 0) return null;
  return (
    <View
      accessible
      accessibilityLabel={`Sequência de ${days} ${days === 1 ? 'dia' : 'dias'}`}
      style={styles.row}
    >
      <Icon name="fire" size={14} color="accent" />
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
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
});