import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { HabitForm, HabitDraft } from '@/features/habit/habit-form';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { scheduledKeysInRange } from '@/domain/habit/isScheduled';
import { addDays, todayKey } from '@/domain/date/dateUtils';
import { EmptyState } from '@/components/feature/EmptyState';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repos, routines, habits } = useData();
  const { showToast } = useToast();

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <AppScaffold title="Editar hábito">
        <EmptyState kind="no-habits" onAction={() => router.push('/habits')} />
      </AppScaffold>
    );
  }

  const onSubmit = async (draft: HabitDraft) => {
    const now = new Date();
    const updated: typeof habit = {
      ...habit,
      ...draft,
      updatedAt: Date.now(),
    };
    await repos.habits.update(updated);
    const future = scheduledKeysInRange(updated, todayKey(now), addDays(todayKey(now), 30));
    await repos.records.ensurePendings(habit.id, future, now);
    showToast('success', 'Hábito atualizado');
    router.back();
  };

  const onArchive = async () => {
    await repos.habits.archive(habit.id, Date.now());
    showToast('info', 'Hábito arquivado');
    router.back();
  };

  const onUnarchive = async () => {
    await repos.habits.unarchive(habit.id);
    showToast('info', 'Hábito restaurado');
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Excluir hábito?', 'Isso apaga o hábito e seu histórico. Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await repos.habits.remove(habit.id);
            showToast('info', 'Hábito excluído');
            router.back();
          })();
        },
      },
    ]);
  };

  const routineOptions = routines.map((r) => ({ label: r.name, value: r.id }));

  return (
    <AppScaffold title="Editar hábito">
      <HabitForm initial={habit} routineOptions={routineOptions} onSubmit={onSubmit} />
      <View style={styles.actions}>
        <Button
          label={habit.archivedAt ? 'Restaurar' : 'Arquivar'}
          variant="ghost"
          onPress={habit.archivedAt ? () => void onUnarchive() : () => void onArchive()}
        />
        <Button label="Excluir" variant="danger" onPress={onDelete} />
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 8,
  },
});