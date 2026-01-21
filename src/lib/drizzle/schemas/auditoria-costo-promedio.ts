import { index, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { itemBodegas } from "./item-bodegas";
import { movimientos } from "./movimientos";
import { user } from "./auth-schema";

export const auditoriaCostoPromedio = pgTable(
  "auditoria_costo_promedio",
  {
    id: text("id").primaryKey(),
    itemBodegaId: text("item_bodega_id")
      .notNull()
      .references(() => itemBodegas.id, { onDelete: "cascade" }),
    movimientoId: text("movimiento_id")
      .notNull()
      .references(() => movimientos.id, { onDelete: "cascade" }),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    costoAnterior: numeric("costo_anterior", { precision: 14, scale: 4, mode: "number" }).notNull(),
    costoNuevo: numeric("costo_nuevo", { precision: 14, scale: 4, mode: "number" }).notNull(),
    cantidadAnterior: numeric("cantidad_anterior", { precision: 14, scale: 4, mode: "number" }).notNull(),
    cantidadNueva: numeric("cantidad_nueva", { precision: 14, scale: 4, mode: "number" }).notNull(),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("auditoria_costo_item_bodega_idx").on(table.itemBodegaId),
    index("auditoria_costo_movimiento_idx").on(table.movimientoId),
    index("auditoria_costo_fecha_idx").on(table.fecha),
  ],
);
