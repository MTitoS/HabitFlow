import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme, AppTheme } from '@/theme/Provider';
import { TodoRow } from '@/components/feature/TodoRow';
import { statusForView } from '@/domain/stats/materializeMissed';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { todosForDay, Todo } from '@/domain/todo/model';
import { spacing } from '@/theme/spacing';

interface Props {
  dateKey: string;
  habits: Habit[];
  records: HabitRecord[];
  todos: Todo[];
  now: Date;
  onToggleTodo: (id: string) => void;
  onClose?: () => void;
}

function statusMeta(
  status: 'completed' | 'skipped' | 'missed' | 'pending',
  theme: AppTheme,
): { symbol: string; color: string; label: string } {
  switch (status) {
    case 'completed':
      return { symbol: '✓', color: theme.color('successBright'), label: 'concluído' };
    case 'skipped':
      return { symbol: '—', color: theme.color('accent'), label: 'pulado' };
    case 'missed':
      return { symbol: '✕', color: theme.color('dangerBright'), label: 'perdido' };
    default:
      return { symbol: '○', color: theme.color('textMuted'), label: 'pendente' };
  }
}

export function CalendarDetail({ dateKey, habits, records, todos, now, onToggleTodo, onClose }: Props) {
  const theme = useTheme();
  const active = habits.filter((h) => !h.archivedAt);
  const rows = active
    .map((habit) => ({ habit, status: statusForView(habit, records, dateKey, now) }))
    .filter((r): r is { habit: Habit; status: 'completed' | 'skipped' | 'missed' | 'pending' } => r.status !== null);
  const dayTodos = todosForDay(todos, dateKey);

  return (
    <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <View style={styles.header}>
        <RNText style={{ fontFamily: 'PlusJakartaSans_700Bold', color: theme.color('textPrimary') }}>
          {dateKey}
        </RNText>
        {onClose ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhe" onPress={onClose} hitSlop={6}>
            <RNText style={{ color: theme.color('primary') }}>Fechar</RNText>
          </Pressable>
        ) : null}
      </View>

      {rows.length === 0 ? (
        <RNText style={{ color: theme.color('textMuted') }}>Nenhum hábito programado.</RNText>
      ) : (
        rows.map(({ habit, status }) => {
          const meta = statusMeta(status, theme);
          return (
            <View
              key={habit.id}
              accessible
              accessibilityLabel={`${habit.name}: ${meta.label}`}
              style={styles.statusRow}
            >
              <RNText style={{ color: meta.color }}>{meta.symbol}</RNText>
              <RNText style={{ color: theme.color('textPrimary'), flex: 1 }}>{habit.name}</RNText>
            </View>
          );
        })
      )}

      {dayTodos.length > 0 ? (
        <View style={styles.todos}>
          {dayTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              checked={todo.completed}
              onToggle={() => onToggleTodo(todo.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  todos: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});