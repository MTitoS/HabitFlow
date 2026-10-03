import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { colorOf } from '@/theme/tokens';
import { Habit } from '@/domain/habit/model';

export type CheckboxState = 'pending' | 'completed' | 'skipped' | 'missed';

const STATUS_META: Record<
  CheckboxState,
  { symbol: string; token: 'success' | 'accent' | 'danger' | 'textMuted'; label: string }
> = {
  completed: { symbol: '✓', token: 'success', label: 'completo' },
  skipped: { symbol: '—', token: 'accent', label: 'pulado' },
  missed: { symbol: '✕', token: 'danger', label: 'perdido' },
  pending: { symbol: '○', token: 'textMuted', label: 'pendente' },
};

interface Props {
  habit: Habit;
  state: CheckboxState;
  onToggle?: () => void;
  disabled?: boolean;
  size?: number;
}

export function HabitCheckbox({ habit, state, onToggle, disabled = false, size = 44 }: Props) {
  const theme = useTheme();
  const meta = STATUS_META[state];
  const symbolColor = colorOf(theme.scheme, meta.token);

  const content = (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: state === 'pending' ? colorOf(theme.scheme, 'border') : symbolColor,
          backgroundColor: state === 'pending' ? colorOf(theme.scheme, 'surface') : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <RNText style={[styles.symbol, { color: symbolColor, fontSize: size * 0.5 }]}>
        {meta.symbol}
      </RNText>
    </View>
  );

  const a11yLabel = `${habit.name}: ${meta.label}`;

  if (!onToggle) {
    return (
      <View accessibilityLabel={a11yLabel} accessible>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ checked: state === 'completed', disabled }}
      disabled={disabled}
      onPress={onToggle}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontWeight: '700',
  },
});