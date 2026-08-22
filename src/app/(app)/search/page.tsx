import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";
import { Kbd } from "@/components/primitives/kbd";

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Search"
        description="Keyword search across titles and bodies."
      />
      <EmptyState
        title="Search is not wired yet."
        description={
          "This screen will be the dominant lookup. Press slash from anywhere."
        }
        action={
          <span className="flex items-center gap-2 text-sm text-muted">
            <Kbd>/</Kbd> to focus
          </span>
        }
      />
    </div>
  );
}
