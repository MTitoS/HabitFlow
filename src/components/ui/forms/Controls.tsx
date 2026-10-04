import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface Props {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? theme.color('primaryEmphasis') : theme.color('surface'),
            borderColor: checked ? theme.color('primaryEmphasis') : theme.color('border'),
          },
        ]}
      >
        <RNText style={[styles.check, { color: checked ? theme.color('onPrimary') : 'transparent' }]}>
          ✓
        </RNText>
      </View>
      <RNText
        style={[
          styles.label,
          { color: disabled ? theme.color('textMuted') : theme.color('textPrimary') },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  );
}

export function Radio({ label, checked, onChange, disabled = false }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: checked ? theme.color('primaryEmphasis') : theme.color('border'),
            backgroundColor: theme.color('surface'),
          },
        ]}
      >
        {checked ? <View style={[styles.radioDot, { backgroundColor: theme.color('primaryEmphasis') }]} /> : null}
      </View>
      <RNText style={[styles.label, { color: theme.color('textPrimary') }]}>{label}</RNText>
    </Pressable>
  );
}

export function Switch({ label, checked, onChange, disabled = false }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: checked ? theme.color('primaryEmphasis') : theme.color('progressTrack'),
          },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              backgroundColor: theme.color('onPrimary'),
              transform: [{ translateX: checked ? 18 : 0 }],
            },
          ]}
        />
      </View>
      <RNText style={[styles.label, { color: theme.color('textPrimary') }]}>{label}</RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 14,
    lineHeight: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  switchTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    flex: 1,
  },
});