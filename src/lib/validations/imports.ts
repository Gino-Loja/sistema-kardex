import { z } from "zod";
import {
  estadoSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
} from "./common";

export const importItemRowSchema = z.object({
  codigo: nonEmptyStringSchema,
  nombre: nonEmptyStringSchema,
  descripcion: nonEmptyStringSchema,
  unidadMedida: nonEmptyStringSchema,
  categoria: nonEmptyStringSchema.optional(),
  costoPromedio: nonNegativeNumberSchema.optional().default(0),
  estado: estadoSchema.optional().default("activo"),
  imagenUrl: z.string().trim().optional(),
});

export type ImportItemRow = z.infer<typeof importItemRowSchema>;
