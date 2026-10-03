import { AppScaffold } from "@/components/layout/AppScaffold";
import { EmptyState } from "@/components/feature/EmptyState";

export default function DataScreen() {
  return (
    <AppScaffold title="data">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}
