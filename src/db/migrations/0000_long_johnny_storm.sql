CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`difficulty_range` text,
	`word_count` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`user_fid` integer,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`accuracy` real NOT NULL,
	`game_start_time` integer NOT NULL,
	`game_end_time` integer NOT NULL,
	`total_duration` integer NOT NULL,
	`tokens_earned` integer DEFAULT 0 NOT NULL,
	`bonus_multiplier` real DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_sessions_game_id_unique` ON `game_sessions` (`game_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_id_idx` ON `game_sessions` (`game_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_fid_idx` ON `game_sessions` (`user_fid`);--> statement-breakpoint
CREATE UNIQUE INDEX `score_idx` ON `game_sessions` (`score`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_name` text NOT NULL,
	`description` text,
	`total_words` integer NOT NULL,
	`successful_imports` integer DEFAULT 0 NOT NULL,
	`failed_imports` integer DEFAULT 0 NOT NULL,
	`duplicates_skipped` integer DEFAULT 0 NOT NULL,
	`source_file` text,
	`imported_by` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`started_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `batch_name_idx` ON `import_batches` (`batch_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `import_status_idx` ON `import_batches` (`status`);--> statement-breakpoint
CREATE TABLE `question_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_session_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	`selected_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`response_time` integer NOT NULL,
	`question_order` integer NOT NULL,
	`shuffled_options` text NOT NULL,
	`answered_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`game_session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_session_idx` ON `question_responses` (`game_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `word_response_idx` ON `question_responses` (`word_id`);--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_fid` integer NOT NULL,
	`total_games_played` integer DEFAULT 0 NOT NULL,
	`total_questions_answered` integer DEFAULT 0 NOT NULL,
	`total_correct_answers` integer DEFAULT 0 NOT NULL,
	`highest_score` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`best_accuracy` real DEFAULT 0 NOT NULL,
	`fastest_average_time` real,
	`total_tokens_earned` integer DEFAULT 0 NOT NULL,
	`total_spins` integer DEFAULT 0 NOT NULL,
	`current_daily_streak` integer DEFAULT 0 NOT NULL,
	`longest_daily_streak` integer DEFAULT 0 NOT NULL,
	`last_played_date` integer,
	`current_difficulty_level` integer DEFAULT 1 NOT NULL,
	`words_learned` integer DEFAULT 0 NOT NULL,
	`first_game_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_stats_user_fid_unique` ON `user_stats` (`user_fid`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_fid_stats_idx` ON `user_stats` (`user_fid`);--> statement-breakpoint
CREATE UNIQUE INDEX `highest_score_idx` ON `user_stats` (`highest_score`);--> statement-breakpoint
CREATE UNIQUE INDEX `total_tokens_idx` ON `user_stats` (`total_tokens_earned`);--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`correct_definition` text NOT NULL,
	`incorrect_definition_1` text NOT NULL,
	`incorrect_definition_2` text NOT NULL,
	`incorrect_definition_3` text NOT NULL,
	`difficulty` integer DEFAULT 1 NOT NULL,
	`category` text,
	`source_language` text DEFAULT 'english',
	`part_of_speech` text,
	`times_shown` integer DEFAULT 0 NOT NULL,
	`times_correct` integer DEFAULT 0 NOT NULL,
	`average_response_time` real,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_shown` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `words_word_unique` ON `words` (`word`);--> statement-breakpoint
CREATE UNIQUE INDEX `word_idx` ON `words` (`word`);