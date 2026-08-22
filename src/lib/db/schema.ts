import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const sources = sqliteTable(
  "sources",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type", { enum: ["paste", "markdown", "url", "note"] }).notNull(),
    title: text("title").notNull(),
    originUrl: text("origin_url"),
    rawContent: text("raw_content").notNull(),
    contentHash: text("content_hash").notNull(),
    status: text("status", { enum: ["pending", "ready", "failed"] }).notNull(),
    errorMessage: text("error_message"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("sources_user_created_idx").on(table.userId, table.createdAt),
    index("sources_user_hash_idx").on(table.userId, table.contentHash),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sources_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const memories = sqliteTable(
  "memories",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    sourceId: text("source_id"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    summary: text("summary"),
    status: text("status", { enum: ["active", "archived"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ingestedAt: integer("ingested_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("memories_user_created_idx").on(table.userId, table.createdAt),
    index("memories_user_status_idx").on(table.userId, table.status),
    index("memories_user_ingested_idx").on(table.userId, table.ingestedAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "memories_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [sources.id],
      name: "memories_source_id_fk",
    }).onDelete("set null"),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized").notNull(),
    color: text("color"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("tags_user_name_unique").on(table.userId, table.nameNormalized),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "tags_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const memoryTags = sqliteTable(
  "memory_tags",
  {
    memoryId: text("memory_id").notNull(),
    tagId: text("tag_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.memoryId, table.tagId] }),
    foreignKey({
      columns: [table.memoryId],
      foreignColumns: [memories.id],
      name: "memory_tags_memory_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "memory_tags_tag_id_fk",
    }).onDelete("cascade"),
  ],
);

export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("threads_user_created_idx").on(table.userId, table.createdAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "threads_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const threadMemories = sqliteTable(
  "thread_memories",
  {
    threadId: text("thread_id").notNull(),
    memoryId: text("memory_id").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.threadId, table.memoryId] }),
    foreignKey({
      columns: [table.threadId],
      foreignColumns: [threads.id],
      name: "thread_memories_thread_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memoryId],
      foreignColumns: [memories.id],
      name: "thread_memories_memory_id_fk",
    }).onDelete("cascade"),
  ],
);

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("api_keys_prefix_idx").on(table.keyPrefix),
    index("api_keys_user_id_idx").on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "api_keys_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  sources: many(sources),
  memories: many(memories),
  tags: many(tags),
  threads: many(threads),
  apiKeys: many(apiKeys),
}));

export const memoriesRelations = relations(memories, ({ one, many }) => ({
  user: one(users, { fields: [memories.userId], references: [users.id] }),
  source: one(sources, { fields: [memories.sourceId], references: [sources.id] }),
  tags: many(memoryTags),
  threads: many(threadMemories),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  user: one(users, { fields: [sources.userId], references: [users.id] }),
  memories: many(memories),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  memories: many(memoryTags),
}));

export const memoryTagsRelations = relations(memoryTags, ({ one }) => ({
  memory: one(memories, {
    fields: [memoryTags.memoryId],
    references: [memories.id],
  }),
  tag: one(tags, { fields: [memoryTags.tagId], references: [tags.id] }),
}));

export const threadsRelations = relations(threads, ({ many }) => ({
  memories: many(threadMemories),
}));

export const threadMemoriesRelations = relations(threadMemories, ({ one }) => ({
  thread: one(threads, {
    fields: [threadMemories.threadId],
    references: [threads.id],
  }),
  memory: one(memories, {
    fields: [threadMemories.memoryId],
    references: [memories.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
