import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export const TIME_OPTIONS: string[] = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '21:00',
  '22:00',
];

interface Props {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  allowNone?: boolean;
}

export function TimePicker({ label, value, onChange, allowNone = true }: Props) {
  const theme = useTheme();

  const pick = (time?: string) => {
    onChange(time ?? undefined);
  };

  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <View style={styles.row}>
        {allowNone ? (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: !value }}
            accessibilityLabel="Sem horário"
            onPress={() => pick(undefined)}
            style={[
              styles.chip,
              {
                backgroundColor: !value ? theme.color('primary') : theme.color('surface'),
                borderColor: !value ? theme.color('primary') : theme.color('border'),
              },
            ]}
          >
            <RNText style={{ color: !value ? '#FFFFFF' : theme.color('textPrimary') }}>
              Sem horário
            </RNText>
          </Pressable>
        ) : null}
        {TIME_OPTIONS.map((time) => (
          <Pressable
            key={time}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === time }}
            accessibilityLabel={time}
            onPress={() => pick(time)}
            style={[
              styles.chip,
              {
                backgroundColor: value === time ? theme.color('primary') : theme.color('surface'),
                borderColor: value === time ? theme.color('primary') : theme.color('border'),
              },
            ]}
          >
            <RNText style={{ color: value === time ? '#FFFFFF' : theme.color('textPrimary') }}>
              {time}
            </RNText>
          </Pressable>
        ))}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});