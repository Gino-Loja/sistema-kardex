import { relations } from "drizzle-orm";
import { index, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { movimientos } from "./movimientos";

export const detalleMovimientos = pgTable(
  "detalle_movimientos",
  {
    id: text("id").primaryKey(),
    movimientoId: text("movimiento_id").notNull(),
    itemId: text("item_id").notNull(),
    cantidad: numeric("cantidad", { precision: 14, scale: 4, mode: "number" })
      .notNull(),
    costoUnitario: numeric("costo_unitario", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    costoTotal: numeric("costo_total", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    // Snapshot del estado después del movimiento para bodega DESTINO (entradas, transferencias)
    stockResultante: numeric("stock_resultante", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    costoPromedioResultante: numeric("costo_promedio_resultante", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    valorTotalResultante: numeric("valor_total_resultante", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    // Snapshot del estado después del movimiento para bodega ORIGEN (salidas, transferencias)
    stockResultanteOrigen: numeric("stock_resultante_origen", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    costoPromedioResultanteOrigen: numeric("costo_promedio_resultante_origen", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    valorTotalResultanteOrigen: numeric("valor_total_resultante_origen", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
  },
  (table) => [index("detalle_movimientos_movimiento_idx").on(table.movimientoId)],
);

export const detalleMovimientosRelations = relations(
  detalleMovimientos,
  ({ one }) => ({
    movimiento: one(movimientos, {
      fields: [detalleMovimientos.movimientoId],
      references: [movimientos.id],
    }),
  }),
);
