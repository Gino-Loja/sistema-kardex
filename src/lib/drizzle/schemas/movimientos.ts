import { index, pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const movimientos = pgTable(
  "movimientos",
  {
    id: text("id").primaryKey(),
    tipo: text("tipo").notNull(),
    subTipo: text("sub_tipo"), // "compra" | "venta" | "devolucion_venta" | "devolucion_compra" | null
    estado: text("estado").notNull().default("borrador"),
    fecha: timestamp("fecha", { withTimezone: true }).notNull(),
    bodegaOrigenId: text("bodega_origen_id"),
    bodegaDestinoId: text("bodega_destino_id"),
    terceroId: text("tercero_id"),
    usuarioId: text("usuario_id").notNull(),
    observacion: text("observacion"),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    version: numeric("version").notNull().default('1'),
  },
  (table) => [
    index("movimientos_estado_idx").on(table.estado),
    index("movimientos_fecha_idx").on(table.fecha),
    index("movimientos_tipo_idx").on(table.tipo),
  ],
);
