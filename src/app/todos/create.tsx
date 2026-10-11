import { router } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { TodoForm, TodoDraft } from '@/features/todo/todo-form';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';

export default function CreateTodoScreen() {
  const { repos } = useData();
  const { showToast } = useToast();

  const onSubmit = async (draft: TodoDraft) => {
    await repos.todos.create(draft);
    showToast('success', 'Tarefa criada');
    router.back();
  };

  return (
    <AppScaffold title="Nova tarefa">
      <TodoForm onSubmit={onSubmit} />
    </AppScaffold>
  );
}