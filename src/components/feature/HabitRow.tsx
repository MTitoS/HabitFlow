import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Habit } from '@/domain/habit/model';
import { HabitIcon } from '@/components/feature/HabitIcon';
import { HabitCheckbox, CheckboxState } from '@/components/feature/HabitCheckbox';
import { Icon } from '@/components/ui/Icon';
import { frequencyLabel } from '@/utils/frequency';

interface Props {
  habit: Habit;
  state: CheckboxState;
  onToggle?: () => void;
  onSkip?: () => void;
  skipDisabled?: boolean;
}

export function HabitRow({ habit, state, onToggle, onSkip, skipDisabled = false }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
      ]}
    >
      <View style={styles.info}>
        <HabitIcon name={habit.icon} color={habit.color} />
        <View style={styles.text}>
          <RNText
            numberOfLines={1}
            style={{ color: theme.color('textPrimary'), fontFamily: 'Inter_500Medium', fontSize: 15 }}
          >
            {habit.name}
          </RNText>
          <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>
            {frequencyLabel(habit.frequency)}
          </RNText>
        </View>
      </View>
      <View style={styles.actions}>
        <HabitCheckbox habit={habit} state={state} onToggle={onToggle} />
        {state === 'pending' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pular ${habit.name} (usar 1 crédito)`}
            accessibilityState={{ disabled: skipDisabled }}
            disabled={skipDisabled}
            onPress={onSkip}
            hitSlop={8}
            style={({ pressed }) => [
              styles.skipButton,
              skipDisabled && styles.skipDisabled,
              pressed && !skipDisabled && styles.skipPressed,
            ]}
          >
            <Icon name="circleSlash2" size={22} color={skipDisabled ? 'textMuted' : 'accent'} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipButton: {
    marginLeft: spacing.xs,
    padding: 4,
  },
  skipDisabled: {
    opacity: 0.35,
  },
  skipPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});