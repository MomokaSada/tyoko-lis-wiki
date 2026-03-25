ALTER TABLE "edit_sessions" ALTER COLUMN "max_edits" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "edit_sessions" ADD COLUMN "edits_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "edit_sessions" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
ALTER TABLE "edit_sessions" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "edit_sessions" DROP COLUMN "start_at";