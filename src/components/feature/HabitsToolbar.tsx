import { Pressable, StyleSheet, Text as RNText, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { HabitSortMode } from '@/domain/habit/sortHabits';
import { Routine } from '@/domain/habit/model';

export const NO_ROUTINE_FILTER = '__no_routine__';

const SORTS: { value: HabitSortMode; label: string }[] = [
  { value: 'added', label: 'Adicionados' },
  { value: 'routine', label: 'Por rotina' },
  { value: 'alpha', label: 'A–Z' },
];

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  sortMode: HabitSortMode;
  onSortModeChange: (mode: HabitSortMode) => void;
  routineFilter: string | null;
  onRoutineFilterChange: (routineId: string | null) => void;
  routines: Routine[];
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.color('primary') : theme.color('surfaceElevated'),
          borderColor: selected ? theme.color('primary') : theme.color('border'),
        },
      ]}
    >
      <RNText
        style={{
          color: selected ? theme.color('onPrimary') : theme.color('textSecondary'),
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
}

export function HabitsToolbar({
  query,
  onQueryChange,
  sortMode,
  onSortModeChange,
  routineFilter,
  onRoutineFilterChange,
  routines,
}: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Buscar hábito"
        placeholder="Buscar hábito"
        placeholderTextColor={theme.color('textMuted')}
        value={query}
        onChangeText={onQueryChange}
        style={[
          styles.input,
          {
            color: theme.color('textPrimary'),
            backgroundColor: theme.color('surface'),
            borderColor: theme.color('border'),
          },
        ]}
      />

      <View style={styles.row}>
        {SORTS.map((sort) => (
          <Chip
            key={sort.value}
            label={sort.label}
            selected={sortMode === sort.value}
            onPress={() => onSortModeChange(sort.value)}
          />
        ))}
      </View>

      <View style={styles.row}>
        <Chip
          label="Todas"
          selected={routineFilter === null}
          onPress={() => onRoutineFilterChange(null)}
        />
        {routines.map((routine) => (
          <Chip
            key={routine.id}
            label={routine.name}
            selected={routineFilter === routine.id}
            onPress={() => onRoutineFilterChange(routine.id)}
          />
        ))}
        <Chip
          label="Sem rotina"
          selected={routineFilter === NO_ROUTINE_FILTER}
          onPress={() => onRoutineFilterChange(NO_ROUTINE_FILTER)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
});
