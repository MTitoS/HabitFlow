import { StyleSheet, Text as RNText, View } from 'react-native';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Select } from '@/components/ui/forms/Select';
import { useTheme, ThemeMode } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';

export default function AppearanceScreen() {
  const theme = useTheme();

  return (
    <AppScaffold title="Aparência">
      <View style={styles.card}>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          Escolha como o HabitFlow deve se apresentar.
        </RNText>
        <Select<ThemeMode>
          label="Tema"
          options={[
            { label: 'Sistema', value: 'system' },
            { label: 'Claro', value: 'light' },
            { label: 'Escuro', value: 'dark' },
          ]}
          value={theme.mode}
          onChange={(mode) => void theme.setMode(mode)}
        />
        <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>
          Atual: {theme.scheme === 'dark' ? 'Escuro' : 'Claro'}
        </RNText>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
});