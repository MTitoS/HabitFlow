import { Animated, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { useBreakpoint } from '@/utils/useBreakpoint';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OPEN } from '@/config/opens';
import { Icon } from '@/components/ui/Icon';
import { triggerSuccess } from '@/services/haptics';

export function AddHabitButton() {
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === 'desktop';
  const insets = useSafeAreaInsets();
  const [scale] = useState(() => new Animated.Value(1));

  const label = 'Novo hábito';

  const handle = () => {
    router.push('/habits/create');
  };

  const pressIn = () => {
    Animated.timing(scale, { toValue: 0.92, duration: 110, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };
  const onPress = () => {
    void triggerSuccess();
    handle();
  };

  if (isDesktop) {
    if (!OPEN.ADD_HABIT_HEADER_DESKTOP) return null;
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

  if (!OPEN.ADD_HABIT_FAB_MOBILE) return null;

  return (
    <Animated.View
      style={[
        styles.fabWrap,
        {
          backgroundColor: theme.color('secondary'),
          bottom: insets.bottom + spacing.huge + 48,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.fabPress}
      >
        <Icon name="plus" size={26} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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