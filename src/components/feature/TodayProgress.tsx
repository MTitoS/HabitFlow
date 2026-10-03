import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

interface Props {
  completed: number;
  total: number;
  percent: number;
}

export function TodayProgress({ completed, total, percent }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
      ]}
    >
      <ProgressRing progress={percent} size={64} strokeWidth={6} label="progresso do dia" />
      <View style={styles.text}>
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: theme.color('textPrimary') }}>
          {completed}/{total}
        </RNText>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          {Math.round(percent * 100)}% concluído hoje
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  text: {
    gap: 2,
  },
});