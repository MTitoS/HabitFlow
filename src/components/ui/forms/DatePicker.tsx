import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { toDateKey } from '@/domain/date/dateUtils';

interface Props {
  label: string;
  value?: string;
  onChange: (dateKey: string) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function DatePicker({ label, value, onChange }: Props) {
  const theme = useTheme();

  const selectedMonth = value ? value.slice(0, 7) : toDateKey(new Date()).slice(0, 7);

  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <View style={styles.grid}>
        {DAYS.map((day) => {
          const dateKey = `${selectedMonth}-${String(day).padStart(2, '0')}`;
          const selected = value === dateKey;
          return (
            <Pressable
              key={day}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={dateKey}
              onPress={() => onChange(dateKey)}
              style={[
                styles.cell,
                {
                  backgroundColor: selected ? theme.color('primary') : theme.color('surface'),
                  borderColor: selected ? theme.color('primary') : theme.color('border'),
                },
              ]}
            >
              <RNText style={{ color: selected ? '#FFFFFF' : theme.color('textPrimary') }}>
                {day}
              </RNText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});