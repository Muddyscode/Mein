import { PageHeader } from "@/components/patterns/page-header";
import { IngestComposer } from "@/components/patterns/ingest-composer";

export default function IngestPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ingest"
        description="Turn messy input into an owned memory."
      />
      <IngestComposer />
    </div>
  );
}
