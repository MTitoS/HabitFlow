import { Pressable } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon: ReactNode;
  size?: number;
}

export function IconButton({ label, onPress, disabled = false, icon, size = 44 }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? theme.color('surfaceElevated') : 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.color('border') : theme.color('border'),
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

export const iconButtonSize = spacing.xl;