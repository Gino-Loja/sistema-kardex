CREATE TYPE "public"."audit_action" AS ENUM('crear', 'editar', 'eliminar', 'publicar', 'anular', 'importar', 'configurar');--> statement-breakpoint
CREATE TYPE "public"."audit_entity" AS ENUM('movimiento', 'item', 'bodega', 'usuario', 'categoria', 'tercero', 'item_bodega', 'configuracion', 'importacion');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"entidad" "audit_entity" NOT NULL,
	"entidad_id" text,
	"accion" "audit_action" NOT NULL,
	"descripcion" text NOT NULL,
	"usuario_id" text,
	"usuario_nombre" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entidad_idx" ON "audit_log" USING btree ("entidad");--> statement-breakpoint
CREATE INDEX "audit_log_accion_idx" ON "audit_log" USING btree ("accion");--> statement-breakpoint
CREATE INDEX "audit_log_usuario_idx" ON "audit_log" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "audit_log_creado_en_idx" ON "audit_log" USING btree ("creado_en");