CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `password_hash` text NOT NULL,
  `name` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade
);
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);

CREATE TABLE `sources` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `origin_url` text,
  `raw_content` text NOT NULL,
  `content_hash` text NOT NULL,
  `status` text NOT NULL,
  `error_message` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade
);
CREATE INDEX `sources_user_created_idx` ON `sources` (`user_id`, `created_at`);
CREATE INDEX `sources_user_hash_idx` ON `sources` (`user_id`, `content_hash`);

CREATE TABLE `memories` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `source_id` text,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `summary` text,
  `status` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `ingested_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade,
  FOREIGN KEY (`source_id`) REFERENCES `sources` (`id`) ON DELETE set null
);
CREATE INDEX `memories_user_created_idx` ON `memories` (`user_id`, `created_at`);
CREATE INDEX `memories_user_status_idx` ON `memories` (`user_id`, `status`);
CREATE INDEX `memories_user_ingested_idx` ON `memories` (`user_id`, `ingested_at`);

CREATE TABLE `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `name_normalized` text NOT NULL,
  `color` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade
);
CREATE UNIQUE INDEX `tags_user_name_unique` ON `tags` (`user_id`, `name_normalized`);

CREATE TABLE `memory_tags` (
  `memory_id` text NOT NULL,
  `tag_id` text NOT NULL,
  PRIMARY KEY (`memory_id`, `tag_id`),
  FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE cascade
);

CREATE TABLE `threads` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade
);
CREATE INDEX `threads_user_created_idx` ON `threads` (`user_id`, `created_at`);

CREATE TABLE `thread_memories` (
  `thread_id` text NOT NULL,
  `memory_id` text NOT NULL,
  `position` integer NOT NULL,
  PRIMARY KEY (`thread_id`, `memory_id`),
  FOREIGN KEY (`thread_id`) REFERENCES `threads` (`id`) ON DELETE cascade,
  FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE cascade
);

CREATE TABLE `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `key_prefix` text NOT NULL,
  `key_hash` text NOT NULL,
  `last_used_at` integer,
  `revoked_at` integer,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE cascade
);
CREATE INDEX `api_keys_prefix_idx` ON `api_keys` (`key_prefix`);
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);

CREATE VIRTUAL TABLE `memory_fts` USING fts5(
  id UNINDEXED,
  user_id UNINDEXED,
  title,
  body,
  tokenize = 'porter unicode61 remove_diacritics 1'
);

CREATE TRIGGER memories_ai AFTER INSERT ON memories BEGIN
  INSERT INTO memory_fts(id, user_id, title, body)
  VALUES (new.id, new.user_id, new.title, new.body);
END;

CREATE TRIGGER memories_ad AFTER DELETE ON memories BEGIN
  DELETE FROM memory_fts WHERE id = old.id;
END;

CREATE TRIGGER memories_au AFTER UPDATE OF title, body, user_id ON memories BEGIN
  DELETE FROM memory_fts WHERE id = old.id;
  INSERT INTO memory_fts(id, user_id, title, body)
  VALUES (new.id, new.user_id, new.title, new.body);
END;
