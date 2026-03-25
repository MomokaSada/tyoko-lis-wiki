ALTER TABLE "account_create_sessions" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
ALTER TABLE "account_create_sessions" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "account_create_sessions" DROP COLUMN "start_at";