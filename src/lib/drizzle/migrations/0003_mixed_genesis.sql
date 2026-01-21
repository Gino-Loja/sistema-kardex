ALTER TABLE "item_bodegas" ADD COLUMN "creado_en" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "item_bodegas" ADD COLUMN "actualizado_en" timestamp DEFAULT now() NOT NULL;