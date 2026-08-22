import { MemoryView } from "@/app/(app)/memories/[id]/memory-view";

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemoryView id={id} />;
}
