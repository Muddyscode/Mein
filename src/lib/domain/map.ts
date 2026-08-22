import type { Memory, Source, Tag } from "@/lib/db/schema";
import type { MemoryDto, SourceDto, TagDto } from "@/lib/domain/types";

export function toIso(value: Date): string {
  return value.toISOString();
}

export function sourceDto(row: Source): SourceDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    originUrl: row.originUrl,
    status: row.status,
    errorMessage: row.errorMessage,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function tagDto(row: Tag): TagDto {
  return { id: row.id, name: row.name, color: row.color };
}

export function memoryDto(
  row: Memory,
  extras?: {
    tags?: TagDto[];
    threads?: { id: string; name: string }[];
    source?: SourceDto;
  },
): MemoryDto {
  return {
    id: row.id,
    sourceId: row.sourceId,
    title: row.title,
    body: row.body,
    summary: row.summary,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    ingestedAt: toIso(row.ingestedAt),
    ...(extras?.tags ? { tags: extras.tags } : {}),
    ...(extras?.threads ? { threads: extras.threads } : {}),
    ...(extras?.source ? { source: extras.source } : {}),
  };
}
