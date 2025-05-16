CREATE TABLE IF NOT EXISTS "stores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"location" geometry(point) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spatial_index" ON "stores" USING gist ("location");