import { AppScaffold } from "@/components/layout/AppScaffold";
import { EmptyState } from "@/components/feature/EmptyState";

export default function DefaultsScreen() {
  return (
    <AppScaffold title="defaults">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}
