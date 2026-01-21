import { z } from "zod"
import {
  idSchema,
  optionalIdSchema,
  nonEmptyStringSchema,
  positiveNumberSchema,
  paginationSchema,
} from "@/lib/validations/common"

// Movement types (excluding "ajuste" as per spec)
export const movementTypeSchema = z.enum(["entrada", "salida", "transferencia"])

export const movementStatusSchema = z.enum(["borrador", "publicado", "anulado"])

// Detail line schema for creating/updating
export const movementDetailInputSchema = z.object({
  itemId: idSchema,
  cantidad: positiveNumberSchema,
  costoUnitario: z.number().nonnegative().optional().nullable(),
})

// Create movement schema with conditional bodega validation
export const movementCreateSchema = z
  .object({
    tipo: movementTypeSchema,
    fecha: z.coerce.date(),
    bodegaOrigenId: optionalIdSchema.nullable(),
    bodegaDestinoId: optionalIdSchema.nullable(),
    terceroId: optionalIdSchema.nullable(),
    documentoReferencia: nonEmptyStringSchema.optional().nullable(),
    observacion: nonEmptyStringSchema.optional().nullable(),
    detalles: z.array(movementDetailInputSchema).min(1, "Al menos un item es requerido"),
  })
  .superRefine((data, ctx) => {
    // Entrada requires bodegaDestinoId
    if (data.tipo === "entrada") {
      if (!data.bodegaDestinoId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bodega destino es requerida para entradas",
          path: ["bodegaDestinoId"],
        })
      }
    }

    // Salida requires bodegaOrigenId
    if (data.tipo === "salida") {
      if (!data.bodegaOrigenId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bodega origen es requerida para salidas",
          path: ["bodegaOrigenId"],
        })
      }
    }

    // Transferencia requires both and they must be different
    if (data.tipo === "transferencia") {
      if (!data.bodegaOrigenId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bodega origen es requerida para transferencias",
          path: ["bodegaOrigenId"],
        })
      }
      if (!data.bodegaDestinoId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bodega destino es requerida para transferencias",
          path: ["bodegaDestinoId"],
        })
      }
      if (data.bodegaOrigenId && data.bodegaDestinoId && data.bodegaOrigenId === data.bodegaDestinoId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bodega origen y destino deben ser diferentes",
          path: ["bodegaDestinoId"],
        })
      }
    }
  })

// Update movement schema (partial, only for borrador state)
export const movementUpdateSchema = z
  .object({
    tipo: movementTypeSchema.optional(),
    fecha: z.coerce.date().optional(),
    bodegaOrigenId: optionalIdSchema.nullable(),
    bodegaDestinoId: optionalIdSchema.nullable(),
    terceroId: optionalIdSchema.nullable(),
    documentoReferencia: nonEmptyStringSchema.optional().nullable(),
    observacion: nonEmptyStringSchema.optional().nullable(),
    detalles: z.array(movementDetailInputSchema).min(1).optional(),
    version: z.number().optional(),
  })

// Query params schema for listing movements
export const movementListQuerySchema = paginationSchema.extend({
  tipo: movementTypeSchema.optional(),
  estado: movementStatusSchema.optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  search: z.string().optional(),
})

// Type exports
export type MovementType = z.infer<typeof movementTypeSchema>
export type MovementStatus = z.infer<typeof movementStatusSchema>
export type MovementDetailInput = z.infer<typeof movementDetailInputSchema>
export type MovementCreateInput = z.infer<typeof movementCreateSchema>
export type MovementUpdateInput = z.infer<typeof movementUpdateSchema>
export type MovementListQuery = z.infer<typeof movementListQuerySchema>
