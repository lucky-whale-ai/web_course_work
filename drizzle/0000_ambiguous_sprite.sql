CREATE TABLE `records` (
	`collection` text NOT NULL,
	`id` text NOT NULL,
	`data` text NOT NULL,
	`email` text,
	`nickname` text,
	PRIMARY KEY(`collection`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_email` ON `records` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_nickname` ON `records` (`nickname`);