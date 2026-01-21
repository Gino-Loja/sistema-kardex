import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const categorias = pgTable(
  "categorias",
  {
    id: text("id").primaryKey(),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    estado: text("estado").notNull().default("activo"),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("categorias_nombre_idx").on(table.nombre),
    index("categorias_estado_idx").on(table.estado),
  ],
);
