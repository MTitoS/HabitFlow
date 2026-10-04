import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { Icon } from '@/components/ui/Icon';

interface Props {
  current: number;
  best: number;
}

export function StreakCard({ current, best }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <View style={styles.item}>
        <Icon name="fire" size={22} color="accent" />
        <RNText style={[styles.value, { color: theme.color('textPrimary') }]}>{current}</RNText>
        <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>sequência atual</RNText>
      </View>
      <View style={[styles.divider, { backgroundColor: theme.color('border') }]} />
      <View style={styles.item}>
        <Icon name="trophy" size={22} color="secondary" />
        <RNText style={[styles.value, { color: theme.color('textPrimary') }]}>{best}</RNText>
        <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>melhor sequência</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 28,
  },
  divider: {
    width: 1,
    height: 40,
  },
});