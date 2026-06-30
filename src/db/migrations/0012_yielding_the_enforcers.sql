CREATE INDEX "idx_categories_name" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_content_view_stats_date" ON "content_view_stats" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_contents_updated_at" ON "contents" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_contents_is_published" ON "contents" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_contents_created_at" ON "contents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_edit_sessions_author_id" ON "edit_sessions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_edit_sessions_created_at" ON "edit_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tags_name" ON "tags" USING btree ("name");