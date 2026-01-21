import { index, numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const itemBodegas = pgTable(
  "item_bodegas",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id").notNull(),
    bodegaId: text("bodega_id").notNull(),
    stockMinimo: numeric("stock_minimo", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    stockMaximo: numeric("stock_maximo", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    stockActual: numeric("stock_actual", {
      precision: 14,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(0),
    costoPromedio: numeric("costo_promedio", {
      precision: 14,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(0),
    valorTotal: numeric("valor_total", {
      precision: 14,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(0),
    // Campos para guardar el saldo inicial (historial)
    stockInicial: numeric("stock_inicial", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    costoInicial: numeric("costo_inicial", {
      precision: 14,
      scale: 4,
      mode: "number",
    }),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("item_bodegas_item_bodega_idx").on(
      table.itemId,
      table.bodegaId,
    ),
    index("item_bodegas_item_idx").on(table.itemId),
    index("item_bodegas_bodega_idx").on(table.bodegaId),
  ],
);
