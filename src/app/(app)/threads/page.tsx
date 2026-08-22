import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";

export default function ThreadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Threads"
        description="Ordered arguments. Not chats."
      />
      <EmptyState title="No threads yet." />
    </div>
  );
}
