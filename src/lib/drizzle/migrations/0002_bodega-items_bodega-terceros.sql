CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"descripcion" text NOT NULL,
	"unidad_medida" text NOT NULL,
	"categoria" text,
	"costo_promedio" numeric(14, 4) DEFAULT '0' NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"imagen_url" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bodegas" (
	"id" text PRIMARY KEY NOT NULL,
	"identificacion" text NOT NULL,
	"nombre" text NOT NULL,
	"ubicacion" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terceros" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"identificacion" text NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"email" text,
	"direccion" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "items_codigo_idx" ON "items" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "items_estado_idx" ON "items" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "bodegas_identificacion_idx" ON "bodegas" USING btree ("identificacion");--> statement-breakpoint
CREATE INDEX "bodegas_estado_idx" ON "bodegas" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "terceros_tipo_identificacion_idx" ON "terceros" USING btree ("tipo","identificacion");--> statement-breakpoint
CREATE INDEX "terceros_estado_idx" ON "terceros" USING btree ("estado");