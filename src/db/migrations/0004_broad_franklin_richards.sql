ALTER TABLE "account_create_sessions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "account_create_sessions" ADD COLUMN "start_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_user_id" uuid;--> statement-breakpoint
ALTER TABLE "edit_sessions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "edit_sessions" ADD COLUMN "start_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_create_sessions" DROP COLUMN "revoked_at";--> statement-breakpoint
ALTER TABLE "edit_sessions" DROP COLUMN "revoked_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id");
