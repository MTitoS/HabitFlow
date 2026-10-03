import { StyleSheet, Text as RNText, View } from 'react-native';
import Constants from 'expo-constants';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';

export default function AboutScreen() {
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <AppScaffold title="Sobre">
      <View style={styles.hero}>
        <RNText style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: theme.color('textPrimary') }}>
          HabitFlow
        </RNText>
        <RNText style={{ color: theme.color('textSecondary') }}>v{version}</RNText>
        <RNText style={{ color: theme.color('textMuted'), textAlign: 'center' }}>
          Hábitos + rotina, 100% local. Sem contas, sem nuvem, sem rastreamento.
        </RNText>
      </View>
      <View style={styles.card}>
        <RNText style={{ color: theme.color('textSecondary') }}>
          • React Native · Expo
          {'\n'}• TypeScript estrito
          {'\n'}• Dados locais no dispositivo
          {'\n'}• Lembretes via expo-notifications
          {'\n'}• Histórico imutável (append-only)
        </RNText>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
});