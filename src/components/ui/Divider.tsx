import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';

export function Divider({ vertical = false }: { vertical?: boolean }) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      style={{
        backgroundColor: theme.color('border'),
        height: vertical ? undefined : StyleSheet.hairlineWidth,
        width: vertical ? StyleSheet.hairlineWidth : undefined,
        marginVertical: vertical ? 0 : spacing.sm,
        alignSelf: vertical ? 'center' : 'stretch',
      }}
    />
  );
}