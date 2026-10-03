import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';

interface Props {
  values: number[];
  max?: number;
}

export function Sparkline({ values, max }: Props) {
  const theme = useTheme();
  const ceiling = max ?? Math.max(1, ...values);
  return (
    <View style={styles.row} accessibilityLabel={`${values.length} pontos de evolução`}>
      {values.map((value, i) => {
        const pct = Math.max(4, (value / ceiling) * 100);
        return (
          <View key={i} style={[styles.track, { backgroundColor: theme.color('surfaceElevated') }]}>
            <View
              style={[
                styles.bar,
                {
                  height: `${pct}%`,
                  backgroundColor: theme.color('accent'),
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 48,
  },
  track: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: radius.sm,
  },
  bar: {
    width: '100%',
    borderRadius: radius.sm,
  },
});