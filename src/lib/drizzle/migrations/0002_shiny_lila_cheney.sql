ALTER TABLE "movimientos" ALTER COLUMN "version" SET DEFAULT '1';--> statement-breakpoint
ALTER TABLE "item_bodegas" ADD COLUMN "valor_total" numeric(14, 4) DEFAULT 0 NOT NULL;