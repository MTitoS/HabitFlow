import { AppScaffold } from '@/components/layout/AppScaffold';
import { EmptyState } from '@/components/feature/EmptyState';

export default function StatisticsScreen() {
  return (
    <AppScaffold title="Estatísticas">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}