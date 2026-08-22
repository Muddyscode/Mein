import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";

export default function IngestPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ingest"
        description="Turn messy input into an owned memory."
      />
      <EmptyState title="Composer arrives next." />
    </div>
  );
}
