CREATE TABLE `recommendation_votes` (
	`user_id` integer NOT NULL,
	`recommendation_id` integer NOT NULL,
	`value` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `recommendation_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recommendation_id`) REFERENCES `recommendations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`kind` text DEFAULT 'movie' NOT NULL,
	`image_url` text,
	`external_url` text,
	`book_author` text,
	`director` text,
	`main_actors` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recommendations_user_id_idx` ON `recommendations` (`user_id`);--> statement-breakpoint
CREATE INDEX `recommendations_created_at_idx` ON `recommendations` (`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`nickname` text,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reset_token` text,
	`reset_token_expires_at` text,
	`reputation` integer DEFAULT 0 NOT NULL,
	`timezone` text DEFAULT 'America/Argentina/Buenos_Aires' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `users` (`nickname`);