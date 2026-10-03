import { AppScaffold } from '@/components/layout/AppScaffold';
import { EmptyState } from '@/components/feature/EmptyState';

export default function AppearanceScreen() {
  return (
    <AppScaffold title="Aparência">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}