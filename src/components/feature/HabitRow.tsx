import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Habit } from '@/domain/habit/model';
import { HabitIcon } from '@/components/feature/HabitIcon';
import { HabitCheckbox, CheckboxState } from '@/components/feature/HabitCheckbox';
import { frequencyLabel } from '@/utils/frequency';

interface Props {
  habit: Habit;
  state: CheckboxState;
  onToggle?: () => void;
  onSkip?: () => void;
}

export function HabitRow({ habit, state, onToggle, onSkip }: Props) {
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
        {state === 'pending' && onSkip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pular ${habit.name} (usar 1 crédito)`}
            onPress={onSkip}
            hitSlop={6}
          >
            <RNText style={{ color: theme.color('accent'), fontSize: 13, fontWeight: '600' }}>
              pular
            </RNText>
          </Pressable>
        ) : null}
        <HabitCheckbox habit={habit} state={state} onToggle={onToggle} />
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
});