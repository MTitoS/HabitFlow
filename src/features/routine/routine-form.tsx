import { useState } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/forms/Input';
import { Select } from '@/components/ui/forms/Select';
import { useTheme } from '@/theme/Provider';
import { Routine } from '@/domain/habit/model';
import { spacing } from '@/theme/spacing';

export type RoutineDraft = Omit<Routine, 'id'>;

interface Props {
  initial?: Routine;
  onSubmit: (draft: RoutineDraft) => Promise<void>;
}

export function RoutineForm({ initial, onSubmit }: Props) {
  const theme = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (name.trim().length === 0) {
      setError('Dê um nome à rotina.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description || undefined, order });
    } catch {
      setError('Não foi possível salvar.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Input label="Nome" placeholder="Ex.: Manhã" value={name} onChangeText={setName} />
      <Input label="Descrição (opcional)" value={description} onChangeText={setDescription} />
      <Select
        label="Ordem"
        options={[0, 1, 2, 3, 4, 5].map((n) => ({ label: `${n}`, value: n }))}
        value={order}
        onChange={setOrder}
      />
      {error ? <RNText style={{ color: theme.color('danger') }}>{error}</RNText> : null}
      <Button label="Salvar rotina" onPress={() => void handleSubmit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
});