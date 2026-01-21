import { z } from "zod";
import {
  idSchema,
  optionalIdSchema,
  paginationSchema,
} from "@/lib/validations/common";

// Movement type filter for kardex
export const kardexMovementTypeSchema = z.enum(["entrada", "salida", "transferencia"]);

// Movement sub-type (for creating/updating movements)
export const movementSubTypeSchema = z.enum([
  "compra",
  "venta",
  "devolucion_venta",
  "devolucion_compra",
]);

// Kardex query parameters schema
// bodegaId is required because stock and costs are per-bodega
export const kardexQuerySchema = paginationSchema.extend({
  itemId: idSchema,
  bodegaId: idSchema, // Required - kardex must be filtered by bodega
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  tipo: kardexMovementTypeSchema.optional(),
});

// Kardex export query (same as kardex query but without pagination)
export const kardexExportQuerySchema = z.object({
  itemId: idSchema,
  bodegaId: idSchema, // Required - kardex must be filtered by bodega
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  tipo: kardexMovementTypeSchema.optional(),
});

// Auditoria query parameters schema
export const auditoriaQuerySchema = paginationSchema.extend({
  itemId: idSchema,
  bodegaId: optionalIdSchema,
});

// Type exports
export type KardexQuery = z.infer<typeof kardexQuerySchema>;
export type KardexExportQuery = z.infer<typeof kardexExportQuerySchema>;
export type AuditoriaQuery = z.infer<typeof auditoriaQuerySchema>;
export type KardexMovementType = z.infer<typeof kardexMovementTypeSchema>;
export type MovementSubType = z.infer<typeof movementSubTypeSchema>;
