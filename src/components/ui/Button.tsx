import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text as RNText } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { ColorToken } from '@/theme/types';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const BACKGROUND: Record<ButtonVariant, ColorToken> = {
  primary: 'primaryEmphasis',
  secondary: 'secondary',
  ghost: 'surfaceElevated',
  danger: 'dangerSolid',
};

const PRESSED: Record<ButtonVariant, ColorToken> = {
  primary: 'primaryPressed',
  secondary: 'secondary',
  ghost: 'border',
  danger: 'dangerSolid',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: Props) {
  const theme = useTheme();
  const isBlocked = disabled || loading;

  const foreground = (): string => {
    if (variant === 'ghost') return theme.color('textPrimary');
    if (isBlocked) return theme.color('textDisabled');
    if (variant === 'secondary') return theme.color('onSecondary');
    return theme.color('onPrimary');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isBlocked
            ? variant === 'primary' || variant === 'danger'
              ? theme.color('primaryDisabled')
              : theme.color('surfaceElevated')
            : theme.color(pressed ? PRESSED[variant] : BACKGROUND[variant]),
        },
      ]}
    >
      {icon ? <RNText style={styles.icon}>{icon}</RNText> : null}
      <RNText
        style={[
          styles.label,
          {
            color: foreground(),
          },
        ]}
      >
        {loading ? 'Carregando…' : label}
      </RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
});