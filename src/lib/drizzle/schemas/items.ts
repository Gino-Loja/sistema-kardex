import { index, numeric, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { categorias } from "./categorias";

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    codigo: text("codigo").notNull(),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion").notNull(),
    unidadMedida: text("unidad_medida").notNull(),
    categoriaId: text("categoria_id").references(() => categorias.id, {
      onDelete: "set null",
    }),
    costoPromedio: numeric("costo_promedio", {
      precision: 14,
      scale: 4,
      mode: "number",
    })
      .notNull()
      .default(0),
    estado: text("estado").notNull().default("activo"),
    imagenUrl: text("imagen_url"),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("items_codigo_idx").on(table.codigo),
    index("items_estado_idx").on(table.estado),
    index("items_categoria_id_idx").on(table.categoriaId),
  ],
);
