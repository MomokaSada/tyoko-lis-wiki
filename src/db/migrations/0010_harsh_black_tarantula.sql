CREATE TABLE "content_view_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"date" date NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_create_sessions" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content_view_stats" ADD CONSTRAINT "content_view_stats_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_view_stats_content_date_idx" ON "content_view_stats" USING btree ("content_id","date");