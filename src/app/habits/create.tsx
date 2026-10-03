import { ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { HabitForm, HabitDraft } from '@/features/habit/habit-form';
import { useData } from '@/data/DataProvider';
import { useTheme } from '@/theme/Provider';
import { scheduledKeysInRange } from '@/domain/habit/isScheduled';
import { addDays, todayKey } from '@/domain/date/dateUtils';
import { useEffect, useState } from 'react';
import { isOnboardingDone } from '@/services/prefs';
import { useToast } from '@/components/ui/Toast';

export default function CreateHabitScreen() {
  const { repos, routines } = useData();
  const { showToast } = useToast();
  const [ready, setReady] = useState<boolean | null>(null);
  const theme = useTheme();

  useEffect(() => {
    isOnboardingDone().then(setReady);
  }, []);

  if (ready === null) {
    return (
      <AppScaffold title="Novo hábito">
        <ActivityIndicator color={theme.color('primary')} />
      </AppScaffold>
    );
  }

  if (ready === false) {
    return <Redirect href="/onboarding" />;
  }

  const onSubmit = async (draft: HabitDraft) => {
    const now = new Date();
    const habit = await repos.habits.create(draft);
    const future = scheduledKeysInRange(habit, todayKey(now), addDays(todayKey(now), 30));
    await repos.records.ensurePendings(habit.id, future, now);
    showToast('success', 'Hábito criado');
    router.replace('/');
  };

  const routineOptions = routines.map((r) => ({ label: r.name, value: r.id }));

  return (
    <AppScaffold title="Novo hábito">
      <HabitForm routineOptions={routineOptions} onSubmit={onSubmit} />
    </AppScaffold>
  );
}