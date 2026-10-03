import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing } from '@/theme/spacing';

interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Grid({ children, columns = 2, gap = 'md', style }: GridProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[gap],
        },
        style,
      ]}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View key={index} style={{ flexBasis: `${100 / columns}%`, paddingHorizontal: spacing[gap] / 2 }}>
              {child}
            </View>
          ))
        : children}
    </View>
  );
}