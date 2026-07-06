ALTER TABLE "users" ADD COLUMN "bot_token_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_bot_token_hash_unique" UNIQUE("bot_token_hash");