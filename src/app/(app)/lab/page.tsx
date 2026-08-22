import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/primitives/empty-state";

export default function LabPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="API"
        description="Keys, playground, and the contract."
      />
      <EmptyState title="The lab opens once keys exist." />
    </div>
  );
}
