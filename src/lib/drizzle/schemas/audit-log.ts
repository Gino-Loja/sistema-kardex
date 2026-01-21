import { index, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const auditEntityEnum = pgEnum("audit_entity", [
  "movimiento",
  "item",
  "bodega",
  "usuario",
  "categoria",
  "tercero",
  "item_bodega",
  "configuracion",
  "importacion",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "crear",
  "editar",
  "eliminar",
  "publicar",
  "anular",
  "importar",
  "configurar",
]);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    entidad: auditEntityEnum("entidad").notNull(),
    entidadId: text("entidad_id"),
    accion: auditActionEnum("accion").notNull(),
    descripcion: text("descripcion").notNull(),
    usuarioId: text("usuario_id").references(() => user.id, { onDelete: "set null" }),
    usuarioNombre: text("usuario_nombre").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_entidad_idx").on(table.entidad),
    index("audit_log_accion_idx").on(table.accion),
    index("audit_log_usuario_idx").on(table.usuarioId),
    index("audit_log_creado_en_idx").on(table.creadoEn),
  ],
);

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
export type AuditEntity = (typeof auditEntityEnum.enumValues)[number];
export type AuditAction = (typeof auditActionEnum.enumValues)[number];
