import { AppScaffold } from '@/components/layout/AppScaffold';
import { EmptyState } from '@/components/feature/EmptyState';

export default function CalendarScreen() {
  return (
    <AppScaffold title="Calendário">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}