import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { TodoRow } from '@/components/feature/TodoRow';
import { isOverdue, sortTodos, todosForDay, Todo } from '@/domain/todo/model';
import { spacing } from '@/theme/spacing';

interface Props {
  todos: Todo[];
  today: string;
  onToggle: (id: string) => void;
}

export function TodayTodos({ todos, today, onToggle }: Props) {
  const theme = useTheme();
  const visible = todosForDay(todos, today).concat(todos.filter((t) => isOverdue(t, today)));

  if (visible.length === 0) return null;

  return (
    <View style={styles.section}>
      <RNText style={[styles.title, { color: theme.color('textMuted') }]}>Tarefas de hoje</RNText>
      <View style={styles.rows}>
        {sortTodos(visible).map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            checked={todo.completed}
            overdue={isOverdue(todo, today)}
            onToggle={() => onToggle(todo.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rows: {
    gap: spacing.sm,
  },
});