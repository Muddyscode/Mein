import type { MeinDb } from "@/lib/db/types";
import { ingestSource } from "@/lib/domain/ingest";
import { createThread } from "@/lib/domain/threads";

const DEMO = [
  {
    title: "What Mein is",
    content:
      "Mein is a personal API for knowledge. Not a workspace. Not a chatbot. A second brain you can curl.",
  },
  {
    title: "The API is the product",
    content:
      "The UI is a lab that proves the HTTP surface. If it cannot be called with a key, it is not shipped.",
  },
  {
    title: "Ingest messy input",
    content:
      "Paste, markdown, a short note, or the text of a URL. File it. Own it. Search it later.",
  },
  {
    title: "Keyword search first",
    content:
      "v1 uses FTS5, not embeddings. Rare words should surface. Magic ranking can wait.",
  },
  {
    title: "Threads are ordered arguments",
    content:
      "A thread is not a chat. It is a sequence of memories you chose. Position matters.",
  },
  {
    title: "Tags are yours",
    content:
      "Names are unique per owner, case-insensitive. demo marks seed data so you can delete it later.",
  },
  {
    title: "Export is ownership",
    content:
      "JSON dump of memories, threads, tags, and sources. Never key hashes. Never password hashes.",
  },
  {
    title: "Keys are shown once",
    content:
      "Create a key in the lab. Copy it. The prefix stays. The secret does not come back.",
  },
  {
    title: "One owner",
    content:
      "This machine has a single owner. userId still lives on every row so the boundary stays honest.",
  },
  {
    title: "Quiet confidence",
    content:
      "Private research OS. Precise. Alive, not loud. If the first two seconds of Library feel like admin CRUD, we failed.",
  },
];

export async function seedDemo(db: MeinDb, userId: string): Promise<void> {
  const thread = createThread(db, userId, {
    name: "Why Mein exists",
    description: "Seeded argument. Marked demo.",
  });
  for (const item of DEMO) {
    await ingestSource(db, userId, {
      type: "note",
      title: item.title,
      content: item.content,
      tagNames: ["demo"],
      threadId: thread.id,
    });
  }
}
