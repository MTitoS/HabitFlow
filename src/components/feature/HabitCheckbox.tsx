import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { colorOf } from '@/theme/tokens';
import { Habit } from '@/domain/habit/model';
import { Icon } from '@/components/ui/Icon';

export type CheckboxState = 'pending' | 'completed' | 'skipped' | 'missed';

const STATUS_META: Record<
  CheckboxState,
  { icon: string | null; label: string; token: 'success' | 'accent' | 'danger' }
> = {
  completed: { icon: 'check', label: 'concluído', token: 'success' },
  skipped: { icon: 'minus', label: 'pulado', token: 'accent' },
  missed: { icon: 'x', label: 'perdido', token: 'danger' },
  pending: { icon: null, label: 'pendente', token: 'success' },
};

interface Props {
  habit: Habit;
  state: CheckboxState;
  onToggle?: () => void;
  disabled?: boolean;
  size?: number;
}

export function HabitCheckbox({ habit, state, onToggle, disabled = false, size = 52 }: Props) {
  const theme = useTheme();
  const meta = STATUS_META[state];
  const isPending = state === 'pending';
  const isCompleted = state === 'completed';

  const borderColor = isPending ? colorOf(theme.scheme, 'border') : colorOf(theme.scheme, meta.token);
  const backgroundColor = isCompleted ? colorOf(theme.scheme, 'success') : 'transparent';
  const symbolColor = isCompleted ? '#FFFFFF' : borderColor;

  const label = onToggle
    ? isPending
      ? `${habit.name}: marcar como concluído`
      : isCompleted
        ? `${habit.name}: desfazer marcação`
        : `${habit.name}: ${meta.label}`
    : `${habit.name}: ${meta.label}`;

  const content = (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {meta.icon && !isPending ? <Icon name={meta.icon} size={size * 0.5} color={symbolColor} /> : null}
    </View>
  );

  if (!onToggle) {
    return (
      <View accessibilityLabel={label} accessible>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isCompleted, disabled }}
      disabled={disabled}
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [pressed && !disabled && styles.pressed]}
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
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});