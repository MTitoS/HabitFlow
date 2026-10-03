import { useEffect, useState } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Select } from '@/components/ui/forms/Select';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { getHabitDefaults, setHabitDefaults } from '@/services/prefs';
import { useToast } from '@/components/ui/Toast';

export default function DefaultsScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [icon, setIcon] = useState<string>('fire');
  const [color, setColor] = useState<string>('primary');
  const [frequencyKind, setFrequencyKind] = useState<string>('daily');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getHabitDefaults().then((defaults) => {
      if (defaults) {
        if (defaults.icon) setIcon(defaults.icon);
        if (defaults.color) setColor(defaults.color);
        if (defaults.frequencyKind) setFrequencyKind(defaults.frequencyKind);
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <AppScaffold title="Padrões" />;

  const save = async () => {
    await setHabitDefaults({ icon, color, frequencyKind });
    showToast('success', 'Padrões salvos');
  };

  return (
    <AppScaffold title="Padrões" actions={<Button label="Salvar" onPress={() => void save()} />}>
      <View style={styles.card}>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          Aplicados na criação de um novo hábito (quando você não escolher algo explícito).
        </RNText>
        <Select
          label="Ícone padrão"
          options={['fire', 'droplet', 'book', 'leaf', 'zap', '🌱'].map((icon) => ({ label: icon, value: icon }))}
          value={icon}
          onChange={setIcon}
        />
        <Select
          label="Cor padrão"
          options={['primary', 'secondary', 'accent', 'success'].map((c) => ({ label: c, value: c }))}
          value={color}
          onChange={setColor}
        />
        <Select
          label="Frequência padrão"
          options={[
            { label: 'Todos os dias', value: 'daily' },
            { label: 'Dias específicos', value: 'weekdays' },
            { label: 'Por semana', value: 'x_per_week' },
            { label: 'Por mês', value: 'x_per_month' },
          ]}
          value={frequencyKind}
          onChange={setFrequencyKind}
        />
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