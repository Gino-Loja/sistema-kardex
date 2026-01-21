import { boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const bodegas = pgTable(
  "bodegas",
  {
    id: text("id").primaryKey(),
    identificacion: text("identificacion").notNull(),
    nombre: text("nombre").notNull(),
    ubicacion: text("ubicacion"),
    auto_update_average_cost: boolean("auto_update_average_cost").default(false).notNull(),
    estado: text("estado").notNull().default("activo"),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("bodegas_identificacion_idx").on(table.identificacion),
    index("bodegas_estado_idx").on(table.estado),
  ],
);
