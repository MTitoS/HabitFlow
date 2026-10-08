import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { ColorToken } from '@/theme/types';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

export interface ChartLegendItem {
  token: ColorToken;
  label: string;
}

const DEFAULT_ITEMS: ChartLegendItem[] = [
  { token: 'chartDone', label: 'Concluído' },
  { token: 'chartSkip', label: 'Skipado' },
  { token: 'chartUndone', label: 'Não concluído' },
];

interface Props {
  items?: ChartLegendItem[];
}

export function ChartLegend({ items = DEFAULT_ITEMS }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.legend} accessibilityLabel={items.map((item) => item.label).join(', ')}>
      {items.map((item) => (
        <View key={item.token} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: theme.color(item.token) }]} />
          <RNText style={[styles.label, { color: theme.color('textMuted') }]}>{item.label}</RNText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 12,
  },
});
