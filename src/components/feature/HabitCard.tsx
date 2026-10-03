import { Pressable, StyleSheet, Text as RNText, View, DimensionValue } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { Habit } from '@/domain/habit/model';
import { HabitIcon } from '@/components/feature/HabitIcon';
import { HabitStreak } from '@/components/feature/HabitStreak';
import { frequencyLabel } from '@/utils/frequency';

interface Props {
  habit: Habit;
  streak: number;
  percent: number;
  onPress?: () => void;
}

export function HabitCard({ habit, streak, percent, onPress }: Props) {
  const theme = useTheme();
  const pct = Math.round(Math.min(1, Math.max(0, percent)) * 100);
  const barWidth = `${pct}%` as DimensionValue;

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
      ]}
    >
      <View style={styles.top}>
        <HabitIcon name={habit.icon} color={habit.color} size={24} />
        <View style={styles.titleBlock}>
          <RNText numberOfLines={1} style={{ color: theme.color('textPrimary'), fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
            {habit.name}
          </RNText>
          <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>
            {frequencyLabel(habit.frequency)}
          </RNText>
        </View>
        <HabitStreak days={habit.type === 'binary' ? streak : streak} />
      </View>
      <View style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
        <View
          style={[styles.fill, { width: barWidth, backgroundColor: theme.color(habit.color) }]}
        />
      </View>
      <RNText style={{ color: theme.color('textMuted'), fontSize: 12, alignSelf: 'flex-end' }}>
        {Math.round(percent * 100)}%
      </RNText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={habit.name} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});