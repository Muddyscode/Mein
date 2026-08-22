import { ThreadView } from "@/app/(app)/threads/[id]/thread-view";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThreadView id={id} />;
}
