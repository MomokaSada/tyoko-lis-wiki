CREATE TABLE "rate_limit_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" "inet" NOT NULL,
	"action" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_edit_logs" ALTER COLUMN "thumbnail" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contents" ALTER COLUMN "current_thumbnail" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contents" ALTER COLUMN "current_thumbnail" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");