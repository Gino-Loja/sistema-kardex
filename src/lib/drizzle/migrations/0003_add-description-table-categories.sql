CREATE TABLE "categorias" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "nombre" text NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "categoria_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_nombre_idx" ON "categorias" USING btree ("nombre");--> statement-breakpoint
CREATE INDEX "categorias_estado_idx" ON "categorias" USING btree ("estado");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_categoria_id_idx" ON "items" USING btree ("categoria_id");--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN "categoria";