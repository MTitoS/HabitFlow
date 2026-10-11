import { StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';
import { TodoRow } from '@/components/feature/TodoRow';
import { groupedByDay, isOverdue, sortTodos, Todo } from '@/domain/todo/model';
import { todayKey } from '@/domain/date/dateUtils';
import { triggerSuccess } from '@/services/haptics';
import { spacing } from '@/theme/spacing';
import { useMemo } from 'react';

export default function TodosScreen() {
  const theme = useTheme();
  const { todos, repos } = useData();
  const { showToast } = useToast();

  const today = todayKey(new Date());
  const groups = useMemo(() => groupedByDay(todos, today), [todos, today]);

  const sections: { title: string; items: Todo[]; showOnlyIfNonEmpty?: boolean }[] = [
    { title: 'Hoje', items: sortTodos(groups.today) },
    { title: 'Algum dia', items: sortTodos(groups.someday) },
    { title: 'Próximas', items: sortTodos(groups.upcoming), showOnlyIfNonEmpty: true },
  ];

  const onToggle = async (todo: Todo) => {
    try {
      if (todo.completed) {
        await repos.todos.setUncompleted(todo.id);
        showToast('info', 'Tarefa marcada como não concluída');
      } else {
        await repos.todos.setCompleted(todo.id, new Date().getTime());
        await triggerSuccess();
        showToast('success', 'Tarefa concluída');
      }
    } catch {
      showToast('error', 'Não foi possível atualizar agora');
    }
  };

  return (
    <AppScaffold
      title="Tarefas"
      actions={<Button label="Nova tarefa" onPress={() => router.push('/todos/create')} />}
    >
      {todos.length === 0 ? (
        <EmptyState kind="no-todos" onAction={() => router.push('/todos/create')} />
      ) : (
        <View style={styles.list}>
          {sections.map((section) => {
            if (section.items.length === 0) return null;
            if (section.showOnlyIfNonEmpty && section.items.length === 0) return null;
            return (
              <View key={section.title} style={styles.section}>
                <RNText style={[styles.sectionTitle, { color: theme.color('textMuted') }]}>
                  {section.title}
                </RNText>
                <View style={styles.rows}>
                  {section.items.map((todo) => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      checked={todo.completed}
                      overdue={isOverdue(todo, today)}
                      onToggle={() => void onToggle(todo)}
                      onPress={(id) => router.push(`/todos/${id}/edit`)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rows: {
    gap: spacing.sm,
  },
});