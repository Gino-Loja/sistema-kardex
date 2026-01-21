CREATE TABLE "movimientos" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"bodega_origen_id" text,
	"bodega_destino_id" text,
	"tercero_id" text,
	"usuario_id" text NOT NULL,
	"observacion" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "detalle_movimientos" (
	"id" text PRIMARY KEY NOT NULL,
	"movimiento_id" text NOT NULL,
	"item_id" text NOT NULL,
	"cantidad" numeric(14, 4) NOT NULL,
	"costo_unitario" numeric(14, 4),
	"costo_total" numeric(14, 4)
);
--> statement-breakpoint
CREATE TABLE "item_bodegas" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"bodega_id" text NOT NULL,
	"stock_minimo" numeric(14, 4),
	"stock_maximo" numeric(14, 4),
	"stock_actual" numeric(14, 4) DEFAULT '0' NOT NULL,
	"costo_promedio" numeric(14, 4) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "movimientos_estado_idx" ON "movimientos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "movimientos_fecha_idx" ON "movimientos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "detalle_movimientos_movimiento_idx" ON "detalle_movimientos" USING btree ("movimiento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_bodegas_item_bodega_idx" ON "item_bodegas" USING btree ("item_id","bodega_id");--> statement-breakpoint
CREATE INDEX "item_bodegas_item_idx" ON "item_bodegas" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_bodegas_bodega_idx" ON "item_bodegas" USING btree ("bodega_id");