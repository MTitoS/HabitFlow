import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { RoutineForm, RoutineDraft } from '@/features/routine/routine-form';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repos, routines } = useData();
  const { showToast } = useToast();
  const routine = routines.find((r) => r.id === id);

  if (!routine) {
    return (
      <AppScaffold title="Editar rotina">
        <EmptyState kind="no-habits" onAction={() => router.push('/routines')} />
      </AppScaffold>
    );
  }

  const onSubmit = async (draft: RoutineDraft) => {
    await repos.routines.update({ ...routine, ...draft });
    showToast('success', 'Rotina atualizada');
    router.back();
  };

  const onDelete = () => {
    Alert.alert('Excluir rotina?', 'Os hábitos da rotina voltam para "sem rotina". Nenhum hábito é apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await repos.routines.remove(routine.id);
            showToast('info', 'Rotina removida');
            router.back();
          })();
        },
      },
    ]);
  };

  return (
    <AppScaffold title="Editar rotina">
      <RoutineForm initial={routine} onSubmit={onSubmit} />
      <View style={styles.actions}>
        <Button label="Excluir rotina" variant="danger" onPress={onDelete} />
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({ actions: { marginTop: 12 } });