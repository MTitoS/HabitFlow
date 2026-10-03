import { Pressable, StyleSheet, Text as RNText } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { useBreakpoint } from '@/utils/useBreakpoint';
import { OPEN } from '@/config/opens';
import { Icon } from '@/components/ui/Icon';

export function AddHabitButton() {
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === 'desktop';

  const label = 'Novo hábito';

  const handle = () => {
    router.push('/habits/create');
  };

  if (isDesktop ? OPEN.ADD_HABIT_HEADER_DESKTOP : OPEN.ADD_HABIT_FAB_MOBILE) {
    if (isDesktop) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={handle}
          style={({ pressed }) => [
            styles.desktopButton,
            {
              backgroundColor: theme.color('primary'),
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Icon name="plus" size={16} color="#FFFFFF" />
          <RNText style={styles.desktopLabel}>Novo hábito</RNText>
        </Pressable>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={handle}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.color('primary'),
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Icon name="plus" size={26} color="#FFFFFF" />
      </Pressable>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  desktopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radius.pill,
  },
  desktopLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});