import { z } from "zod";

export const idSchema = z.string().trim().min(1, "Requerido");
export const optionalIdSchema = idSchema.optional();

export const nonEmptyStringSchema = z.string().trim().min(1, "Requerido");
export const emailSchema = z.string().email();

export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().nonnegative();

export const dateSchema = z.coerce.date();

export const estadoSchema = z.enum(["activo", "inactivo"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
