import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { TodoForm, TodoDraft } from '@/features/todo/todo-form';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { todos, repos } = useData();
  const { showToast } = useToast();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return (
      <AppScaffold title="Editar tarefa">
        <EmptyState kind="no-todos" onAction={() => router.push('/todos')} />
      </AppScaffold>
    );
  }

  const onSubmit = async (draft: TodoDraft) => {
    await repos.todos.update({ ...todo, ...draft });
    showToast('success', 'Tarefa atualizada');
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Excluir tarefa?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await repos.todos.remove(todo.id);
            showToast('info', 'Tarefa removida');
            router.back();
          })();
        },
      },
    ]);
  };

  return (
    <AppScaffold title="Editar tarefa">
      <TodoForm initial={todo} onSubmit={onSubmit} />
      <View style={styles.actions}>
        <Button label="Excluir tarefa" variant="danger" onPress={onDelete} />
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({ actions: { marginTop: 12 } });