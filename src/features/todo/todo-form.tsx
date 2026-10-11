import { useState } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/forms/Input';
import { DatePicker } from '@/components/ui/forms/DatePicker';
import { useTheme } from '@/theme/Provider';
import { Todo, validateTodoTitle } from '@/domain/todo/model';
import { spacing } from '@/theme/spacing';

export interface TodoDraft {
  title: string;
  date?: string;
}

interface Props {
  initial?: Todo;
  onSubmit: (draft: TodoDraft) => Promise<void>;
}

export function TodoForm({ initial, onSubmit }: Props) {
  const theme = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate] = useState<string | undefined>(initial?.date);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!validateTodoTitle(title)) {
      setError('Dê um título à tarefa.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ title: title.trim(), date });
    } catch {
      setError('Não foi possível salvar.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Input label="Título" placeholder="Ex.: Comprar leite" value={title} onChangeText={setTitle} />
      <View style={styles.dateBox}>
        <DatePicker label="Data (opcional)" value={date} onChange={setDate} />
        {date ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover data"
            onPress={() => setDate(undefined)}
            hitSlop={6}
          >
            <RNText style={{ color: theme.color('primary'), fontWeight: '600', fontSize: 14 }}>
              Remover data (vira Algum dia)
            </RNText>
          </Pressable>
        ) : null}
      </View>
      {error ? <RNText style={{ color: theme.color('danger') }}>{error}</RNText> : null}
      <Button label="Salvar tarefa" onPress={() => void handleSubmit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  dateBox: {
    gap: spacing.sm,
  },
});