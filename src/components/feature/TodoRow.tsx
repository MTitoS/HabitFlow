import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Todo } from '@/domain/todo/model';

interface Props {
  todo: Todo;
  checked: boolean;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
  overdue?: boolean;
}

export function TodoRow({ todo, checked, onToggle, onPress, overdue = false }: Props) {
  const theme = useTheme();
  const label = checked ? `${todo.title}: concluída` : `Marcar ${todo.title} como concluída`;

  return (
    <View
      testID={`todo-row-${todo.id}`}
      style={[styles.row, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked }}
        onPress={() => onToggle(todo.id)}
        hitSlop={6}
        style={styles.toggle}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: checked ? theme.color('success') : theme.color('borderStrong'),
              backgroundColor: checked ? theme.color('success') : 'transparent',
            },
          ]}
        >
          {checked ? (
            <RNText style={[styles.checkGlyph, { color: theme.color('onSuccess') }]}>✓</RNText>
          ) : null}
        </View>
        <RNText
          numberOfLines={1}
          style={[
            styles.title,
            { color: theme.color('textPrimary') },
            checked && { textDecorationLine: 'line-through', opacity: 0.6 },
          ]}
        >
          {todo.title}
        </RNText>
        {overdue && !checked ? (
          <RNText
            testID={`todo-overdue-${todo.id}`}
            style={[styles.badge, { color: theme.color('danger'), borderColor: theme.color('danger') }]}
          >
            atrasada
          </RNText>
        ) : null}
      </Pressable>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${todo.title}`}
          onPress={() => onPress(todo.id)}
          hitSlop={6}
          style={styles.edit}
        >
          <RNText style={{ color: theme.color('textMuted'), fontSize: 22 }}>›</RNText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  edit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});