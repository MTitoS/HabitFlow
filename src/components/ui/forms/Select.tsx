import { Pressable, StyleSheet, View, Text as RNText } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface SelectOption<T extends string | number> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

interface Props<T extends string | number> {
  label: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function Select<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: Props<T>) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={option.label}
              key={String(option.value)}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected
                    ? theme.color('primaryEmphasis')
                    : theme.color('surface'),
                  borderColor: selected ? theme.color('primaryEmphasis') : theme.color('border'),
                },
              ]}
            >
              <RNText
                style={[
                  styles.optionLabel,
                  { color: selected ? theme.color('onPrimary') : theme.color('textPrimary') },
                ]}
              >
                {option.icon ? `${option.icon} ` : ''}
                {option.label}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.input,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});