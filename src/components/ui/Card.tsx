import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export type CardVariant = 'default' | 'interactive' | 'selected' | 'disabled';

interface Props {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: object;
}

export function Card({ children, variant = 'default', onPress, style }: Props) {
  const theme = useTheme();
  const themedStyle = {
    backgroundColor:
      variant === 'selected' ? theme.color('surfaceElevated') : theme.color('surface'),
    borderColor:
      variant === 'selected'
        ? theme.color('primary')
        : variant === 'disabled'
          ? theme.color('border')
          : theme.color('border'),
  };

  if (onPress || variant === 'interactive' || variant === 'disabled') {
    return (
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={variant === 'disabled'}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          themedStyle,
          pressed && variant !== 'disabled' && { backgroundColor: theme.color('surfacePressed') },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, themedStyle, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
});