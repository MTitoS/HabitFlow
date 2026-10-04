import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { ColorToken, HABIT_COLOR_OPTIONS } from '@/theme/types';
import { colorOf } from '@/theme/tokens';

interface Props {
  label: string;
  value: ColorToken;
  onChange: (token: ColorToken) => void;
}

export function ColorPicker({ label, value, onChange }: Props) {
  const theme = useTheme();
  const scheme = theme.scheme;

  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <View style={styles.row}>
        {HABIT_COLOR_OPTIONS.map((token) => {
          const selected = token === value;
          return (
            <Pressable
              key={token}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={token}
              onPress={() => onChange(token)}
              style={[
                styles.swatch,
                {
                  backgroundColor: colorOf(scheme, token),
                  borderColor: selected ? theme.color('primary') : theme.color('border'),
                },
              ]}
            >
              {selected ? (
                <RNText style={[styles.check, { color: theme.color('onPrimary') }]}>✓</RNText>
              ) : null}
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
    gap: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 18,
  },
});