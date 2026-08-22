import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Account, export, sign out." />
      <EmptyState title="Export and account controls land with the API." />
    </div>
  );
}
