import { router } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { RoutineForm } from '@/features/routine/routine-form';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';

export default function CreateRoutineScreen() {
  const { repos } = useData();
  const { showToast } = useToast();

  const onSubmit = async (draft: any) => {
    await repos.routines.create(draft);
    showToast('success', 'Rotina criada');
    router.back();
  };

  return (
    <AppScaffold title="Nova rotina">
      <RoutineForm onSubmit={onSubmit} />
    </AppScaffold>
  );
}
