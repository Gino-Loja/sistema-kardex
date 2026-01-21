CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimientos" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"sub_tipo" text,
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
	"stock_actual" numeric(14, 4) DEFAULT 0 NOT NULL,
	"costo_promedio" numeric(14, 4) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"unidad_medida" text NOT NULL,
	"categoria_id" text,
	"costo_promedio" numeric(14, 4) DEFAULT 0 NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"imagen_url" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bodegas" (
	"id" text PRIMARY KEY NOT NULL,
	"identificacion" text NOT NULL,
	"nombre" text NOT NULL,
	"ubicacion" text,
	"auto_update_average_cost" boolean DEFAULT false NOT NULL,
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
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_item_bodega_id_item_bodegas_id_fk" FOREIGN KEY ("item_bodega_id") REFERENCES "public"."item_bodegas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_movimiento_id_movimientos_id_fk" FOREIGN KEY ("movimiento_id") REFERENCES "public"."movimientos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_costo_promedio" ADD CONSTRAINT "auditoria_costo_promedio_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "movimientos_estado_idx" ON "movimientos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "movimientos_fecha_idx" ON "movimientos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "movimientos_tipo_idx" ON "movimientos" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "detalle_movimientos_movimiento_idx" ON "detalle_movimientos" USING btree ("movimiento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_bodegas_item_bodega_idx" ON "item_bodegas" USING btree ("item_id","bodega_id");--> statement-breakpoint
CREATE INDEX "item_bodegas_item_idx" ON "item_bodegas" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_bodegas_bodega_idx" ON "item_bodegas" USING btree ("bodega_id");--> statement-breakpoint
CREATE INDEX "auditoria_costo_item_bodega_idx" ON "auditoria_costo_promedio" USING btree ("item_bodega_id");--> statement-breakpoint
CREATE INDEX "auditoria_costo_movimiento_idx" ON "auditoria_costo_promedio" USING btree ("movimiento_id");--> statement-breakpoint
CREATE INDEX "auditoria_costo_fecha_idx" ON "auditoria_costo_promedio" USING btree ("fecha");--> statement-breakpoint
CREATE UNIQUE INDEX "items_codigo_idx" ON "items" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "items_estado_idx" ON "items" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "items_categoria_id_idx" ON "items" USING btree ("categoria_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categorias_nombre_idx" ON "categorias" USING btree ("nombre");--> statement-breakpoint
CREATE INDEX "categorias_estado_idx" ON "categorias" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "bodegas_identificacion_idx" ON "bodegas" USING btree ("identificacion");--> statement-breakpoint
CREATE INDEX "bodegas_estado_idx" ON "bodegas" USING btree ("estado");--> statement-breakpoint
CREATE UNIQUE INDEX "terceros_tipo_identificacion_idx" ON "terceros" USING btree ("tipo","identificacion");--> statement-breakpoint
CREATE INDEX "terceros_estado_idx" ON "terceros" USING btree ("estado");