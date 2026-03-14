CREATE TYPE "public"."snapshot_type" AS ENUM('snapshot', 'diff');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('owner', 'admin', 'bot');--> statement-breakpoint
CREATE TABLE "devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip" "inet" NOT NULL,
	"browser" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_edit_log_categories" (
	"edit_log_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "content_edit_log_categories_edit_log_id_category_id_pk" PRIMARY KEY("edit_log_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "account_create_sessions" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"is_active" boolean NOT NULL,
	"start_at" timestamp DEFAULT now() NOT NULL,
	"end_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_edit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"device_session_id" integer,
	"user_id" integer,
	"revision_number" integer NOT NULL,
	"type" "snapshot_type" NOT NULL,
	"title" varchar(255),
	"data" text,
	"thumbnail" varchar(512),
	"tag_changed" boolean,
	"category_changed" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_categories" (
	"content_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "content_categories_content_id_category_id_pk" PRIMARY KEY("content_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"session_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_edit_log_tags" (
	"edit_log_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "content_edit_log_tags_edit_log_id_tag_id_pk" PRIMARY KEY("edit_log_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" varchar(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_create_session_id" uuid,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"type" "user_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"current_title" varchar(255) NOT NULL,
	"current_content" text NOT NULL,
	"current_thumbnail" varchar(512) NOT NULL,
	"latest_revision" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "block_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"blocked_by" integer NOT NULL,
	"reason" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_tags" (
	"content_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "content_tags_content_id_tag_id_pk" PRIMARY KEY("content_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "edit_sessions" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"max_edits" integer DEFAULT 50,
	"is_active" boolean NOT NULL,
	"start_at" timestamp DEFAULT now() NOT NULL,
	"end_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(512) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_edit_log_categories" ADD CONSTRAINT "content_edit_log_categories_edit_log_id_content_edit_logs_id_fk" FOREIGN KEY ("edit_log_id") REFERENCES "public"."content_edit_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_log_categories" ADD CONSTRAINT "content_edit_log_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_create_sessions" ADD CONSTRAINT "account_create_sessions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_logs" ADD CONSTRAINT "content_edit_logs_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_logs" ADD CONSTRAINT "content_edit_logs_device_session_id_device_sessions_id_fk" FOREIGN KEY ("device_session_id") REFERENCES "public"."device_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_logs" ADD CONSTRAINT "content_edit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_session_id_edit_sessions_uuid_fk" FOREIGN KEY ("session_id") REFERENCES "public"."edit_sessions"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_log_tags" ADD CONSTRAINT "content_edit_log_tags_edit_log_id_content_edit_logs_id_fk" FOREIGN KEY ("edit_log_id") REFERENCES "public"."content_edit_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_edit_log_tags" ADD CONSTRAINT "content_edit_log_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_devices" ADD CONSTRAINT "block_devices_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_devices" ADD CONSTRAINT "block_devices_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edit_sessions" ADD CONSTRAINT "edit_sessions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;