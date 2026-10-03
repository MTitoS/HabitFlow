import { StyleSheet, Text as RNText, View } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/forms/Input';
import { useToast } from '@/components/ui/Toast';
import { spacing } from '@/theme/spacing';
import { buildExport, importPayload, validatePayload } from '@/data/exportImport';

export default function DataScreen() {
  const theme = useTheme();
  const { store, reload } = useData();
  const { showToast } = useToast();
  const [exportText, setExportText] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  const onExport = () => {
    const payload = buildExport(store);
    setExportText(JSON.stringify(payload, null, 2));
  };

  const onImport = async () => {
    try {
      await importPayload(store, importText);
      await reload();
      showToast('success', 'Backup restaurado');
      setImportText('');
    } catch {
      showToast('error', 'Formato de backup inválido');
    }
  };

  return (
    <AppScaffold title="Dados">
      <View style={styles.card}>
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', color: theme.color('textPrimary'), fontSize: 16 }}>
          Exportar
        </RNText>
        <RNText style={{ color: theme.color('textSecondary'), fontSize: 13 }}>
          Gere um backup JSON com todos os seus hábitos e histórico. Não há conta nem nuvem.
        </RNText>
        <Button label="Gerar backup" variant="ghost" onPress={onExport} />
        {exportText ? (
          <Textarea
            label="Backup"
            value={exportText}
            onChangeText={setExportText}
            editable={false}
            style={{ minHeight: 120 }}
          />
        ) : null}
      </View>

      <View style={styles.card}>
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', color: theme.color('textPrimary'), fontSize: 16 }}>
          Importar
        </RNText>
        <Input label="Cole um backup JSON" value={importText} onChangeText={setImportText} />
        <Button
          label="Restaurar backup"
          variant="ghost"
          disabled={importText.trim().length === 0 || !validatePayload(importText)}
          onPress={() => void onImport()}
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