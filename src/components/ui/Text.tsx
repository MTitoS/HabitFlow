import { ReactNode } from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { typeScale, TypeToken } from '@/theme/typography';
import { useTheme } from '@/theme/Provider';

interface Props {
  children: ReactNode;
  variant?: TypeToken;
  color?: 'textPrimary' | 'textSecondary' | 'textMuted';
  style?: TextStyle;
}

export function Text({ children, variant = 'body', color = 'textPrimary', style }: Props) {
  const theme = useTheme();
  return (
    <RNText
      style={[
        typeScale[variant],
        { color: theme.color(color) },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}