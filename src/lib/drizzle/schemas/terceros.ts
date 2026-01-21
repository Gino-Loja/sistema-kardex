import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const terceros = pgTable(
  "terceros",
  {
    id: text("id").primaryKey(),
    tipo: text("tipo").notNull(),
    identificacion: text("identificacion").notNull(),
    nombre: text("nombre").notNull(),
    telefono: text("telefono"),
    email: text("email"),
    direccion: text("direccion"),
    estado: text("estado").notNull().default("activo"),
    creadoEn: timestamp("creado_en").defaultNow().notNull(),
    actualizadoEn: timestamp("actualizado_en")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("terceros_tipo_identificacion_idx").on(
      table.tipo,
      table.identificacion,
    ),
    index("terceros_estado_idx").on(table.estado),
  ],
);
