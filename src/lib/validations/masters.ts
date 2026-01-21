import { z } from "zod";
import {
  emailSchema,
  estadoSchema,
  idSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  optionalIdSchema,
} from "./common";

export const itemCreateSchema = z.object({
  codigo: nonEmptyStringSchema,
  nombre: nonEmptyStringSchema,
  descripcion: nonEmptyStringSchema,
  unidadMedida: nonEmptyStringSchema,
  categoriaId: optionalIdSchema.nullable(),
  costoPromedio: nonNegativeNumberSchema.default(0),
  estado: estadoSchema.default("activo"),
  imagenUrl: z.string().trim().optional(),
});

export const itemUpdateSchema = z.object({
  id: idSchema,
  codigo: nonEmptyStringSchema.optional(),
  nombre: nonEmptyStringSchema.optional(),
  descripcion: nonEmptyStringSchema.optional(),
  unidadMedida: nonEmptyStringSchema.optional(),
  categoriaId: optionalIdSchema.nullable(),
  costoPromedio: nonNegativeNumberSchema.optional(),
  estado: estadoSchema.optional(),
  imagenUrl: z.string().trim().optional(),
});

export const categoriaCreateSchema = z.object({
  nombre: nonEmptyStringSchema,
  descripcion: nonEmptyStringSchema.optional(),
  estado: estadoSchema.default("activo"),
});

export const categoriaUpdateSchema = z.object({
  id: idSchema,
  nombre: nonEmptyStringSchema.optional(),
  descripcion: nonEmptyStringSchema.optional(),
  estado: estadoSchema.optional(),
});

export const bodegaCreateSchema = z.object({
  identificacion: nonEmptyStringSchema,
  nombre: nonEmptyStringSchema,
  ubicacion: nonEmptyStringSchema.optional(),
  estado: estadoSchema.default("activo"),
});

export const bodegaUpdateSchema = z.object({
  id: idSchema,
  identificacion: nonEmptyStringSchema.optional(),
  nombre: nonEmptyStringSchema.optional(),
  ubicacion: nonEmptyStringSchema.optional(),
  auto_update_average_cost: z.boolean().optional(),
  estado: estadoSchema.optional(),
});

export const terceroTipoSchema = z.enum(["proveedor", "cliente"]);

export const terceroCreateSchema = z.object({
  tipo: terceroTipoSchema,
  identificacion: nonEmptyStringSchema,
  nombre: nonEmptyStringSchema,
  telefono: nonEmptyStringSchema.optional(),
  email: emailSchema.optional(),
  direccion: nonEmptyStringSchema.optional(),
  estado: estadoSchema.default("activo"),
});

export const terceroUpdateSchema = z.object({
  id: idSchema,
  tipo: terceroTipoSchema.optional(),
  identificacion: nonEmptyStringSchema.optional(),
  nombre: nonEmptyStringSchema.optional(),
  telefono: nonEmptyStringSchema.optional(),
  email: emailSchema.optional(),
  direccion: nonEmptyStringSchema.optional(),
  estado: estadoSchema.optional(),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;
export type CategoriaCreateInput = z.infer<typeof categoriaCreateSchema>;
export type CategoriaUpdateInput = z.infer<typeof categoriaUpdateSchema>;
export type BodegaCreateInput = z.infer<typeof bodegaCreateSchema>;
export type BodegaUpdateInput = z.infer<typeof bodegaUpdateSchema>;
export type TerceroCreateInput = z.infer<typeof terceroCreateSchema>;
export type TerceroUpdateInput = z.infer<typeof terceroUpdateSchema>;
