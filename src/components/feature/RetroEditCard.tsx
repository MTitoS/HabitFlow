import { StyleSheet, Text as RNText, View } from 'react-native';
import { Switch } from '@/components/ui/forms/Controls';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';

interface Props {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export function RetroEditCard({ enabled, onChange }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
      ]}
    >
      <Switch label="Permitir edição retroativa" checked={enabled} onChange={onChange} />
      <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
        Exceção: permite marcar ontem ou anteontem como concluído (edição em dias passados, janela de
        2 dias). Desligado por padrão.
      </RNText>
    </View>
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
