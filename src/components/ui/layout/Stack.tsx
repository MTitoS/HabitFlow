import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing } from '@/theme/spacing';

interface StackProps {
  children: ReactNode;
  gap?: keyof typeof spacing;
  align?: ViewStyle['alignItems'];
  style?: ViewStyle;
}

export function Stack({ children, gap = 'md', align, style }: StackProps) {
  return (
    <View style={[styles, { gap: spacing[gap], alignItems: align }, style]}>{children}</View>
  );
}

const styles: ViewStyle = {
  flexDirection: 'column',
};