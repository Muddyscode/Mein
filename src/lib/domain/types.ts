export type SourceType = "paste" | "markdown" | "url" | "note";
export type SourceStatus = "pending" | "ready" | "failed";
export type MemoryStatus = "active" | "archived";

export type SourceDto = {
  id: string;
  type: SourceType;
  title: string;
  originUrl: string | null;
  status: SourceStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TagDto = {
  id: string;
  name: string;
  color: string | null;
};

export type MemoryDto = {
  id: string;
  sourceId: string | null;
  title: string;
  body: string;
  summary: string | null;
  status: MemoryStatus;
  createdAt: string;
  updatedAt: string;
  ingestedAt: string;
  tags?: TagDto[];
  threads?: { id: string; name: string }[];
  source?: SourceDto;
};

export type ThreadDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  memoryCount?: number;
};
