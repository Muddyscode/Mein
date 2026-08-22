import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";
import { Button } from "@/components/primitives/button";

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Library"
        description="Everything you have filed."
        action={<Button href="/ingest">Ingest</Button>}
      />
      <EmptyState
        title="Nothing filed yet."
        description="Ingest a paste, a note, markdown, or a URL. The API will remember it."
        action={<Button href="/ingest">Ingest your first source</Button>}
      />
    </div>
  );
}
