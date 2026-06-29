CREATE TYPE "public"."purpose_type" AS ENUM('register', 'login');--> statement-breakpoint
CREATE TABLE "app_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	CONSTRAINT "app_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "passkeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" varchar(255) DEFAULT '',
	"device_name" varchar(255) DEFAULT '',
	"backed_up" boolean DEFAULT false,
	"device_type" varchar(100) DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "passkeys_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "webauthn_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"purpose" "purpose_type" NOT NULL,
	"challenge" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_app_sessions_user" ON "app_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_app_sessions_token" ON "app_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "idx_app_sessions_expires" ON "app_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_passkeys_user_id" ON "passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_passkeys_credential_id" ON "passkeys" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_webauthn_challenges_user" ON "webauthn_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_webauthn_challenges_expires" ON "webauthn_challenges" USING btree ("expires_at");