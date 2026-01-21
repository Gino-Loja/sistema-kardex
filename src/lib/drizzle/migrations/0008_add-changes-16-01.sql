CREATE TABLE "auditoria_costo_promedio" (
	"id" text PRIMARY KEY NOT NULL,
	"item_bodega_id" text NOT NULL,
	"movimiento_id" text NOT NULL,
	"usuario_id" text NOT NULL,
	"costo_anterior" numeric(14, 4) NOT NULL,
	"costo_nuevo" numeric(14, 4) NOT NULL,
	"cantidad_anterior" numeric(14, 4) NOT NULL,
	"cantidad_nueva" numeric(14, 4) NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_bodegas" ALTER COLUMN "stock_actual" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "item_bodegas" ALTER COLUMN "costo_promedio" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "costo_promedio" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "movimientos" ADD COLUMN "sub_tipo" text;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_item_bodega_id_item_bodegas_id_fk" FOREIGN KEY ("item_bodega_id") REFERENCES "public"."item_bodegas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_movimiento_id_movimientos_id_fk" FOREIGN KEY ("movimiento_id") REFERENCES "public"."movimientos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditoria_costo_item_bodega_idx" ON "auditoria_costo_promedio" USING btree ("item_bodega_id");--> statement-breakpoint
CREATE INDEX "auditoria_costo_movimiento_idx" ON "auditoria_costo_promedio" USING btree ("movimiento_id");--> statement-breakpoint
CREATE INDEX "auditoria_costo_fecha_idx" ON "auditoria_costo_promedio" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "movimientos_tipo_idx" ON "movimientos" USING btree ("tipo");