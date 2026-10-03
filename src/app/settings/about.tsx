import { AppScaffold } from "@/components/layout/AppScaffold";
import { EmptyState } from "@/components/feature/EmptyState";

export default function AboutScreen() {
  return (
    <AppScaffold title="about">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}
