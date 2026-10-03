import { router } from 'expo-router';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/Provider';
import { setOnboardingDone } from '@/services/prefs';

export default function OnboardingScreen() {
  const theme = useTheme();

  const start = async () => {
    await setOnboardingDone();
    router.replace('/habits/create');
  };

  return (
    <AppScaffold title="Bem-vindo">
      <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
        <RNText style={styles.emoji}>🌱</RNText>
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: theme.color('textPrimary'), textAlign: 'center' }}>
          Construa melhores hábitos, um dia de cada vez.
        </RNText>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 15, textAlign: 'center' }}>
          Simples, local e sem contas. Seus dados ficam no seu dispositivo.
        </RNText>
        <Button label="Começar" onPress={() => void start()} />
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 20,
    padding: 32,
    borderRadius: 28,
    borderWidth: 1,
    alignSelf: 'center',
    maxWidth: 420,
    width: '100%',
    marginTop: 48,
  },
  emoji: {
    fontSize: 56,
  },
});