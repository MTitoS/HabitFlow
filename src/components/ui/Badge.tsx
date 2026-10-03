import { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { ColorToken } from '@/theme/types';

interface Props {
  children: ReactNode;
  color?: ColorToken;
  label?: string;
}

export function Badge({ children, color = 'primary', label }: Props) {
  const theme = useTheme();
  const backgroundColor = theme.color(color);

  return (
    <View
      accessibilityLabel={label ?? (typeof children === 'string' ? children : undefined)}
      style={{
        backgroundColor,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
      }}
    >
      {children}
    </View>
  );
}