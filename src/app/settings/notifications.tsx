import { AppScaffold } from "@/components/layout/AppScaffold";
import { EmptyState } from "@/components/feature/EmptyState";

export default function NotificationsScreen() {
  return (
    <AppScaffold title="notifications">
      <EmptyState kind="no-stats" />
    </AppScaffold>
  );
}
