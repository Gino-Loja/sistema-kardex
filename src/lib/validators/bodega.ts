import { z } from "zod"
import { nonNegativeNumberSchema, paginationSchema } from "@/lib/validations/common"
import { bodegaCreateSchema, bodegaUpdateSchema } from "@/lib/validations/masters"
import { assignItemsCombinedSchema } from "@/lib/validators/item-bodega"

export const bodegaPatchSchema = bodegaUpdateSchema.omit({ id: true })

export const bodegaListQuerySchema = paginationSchema

// Legacy schema for backwards compatibility
export const bodegaAssignmentSchema = z.object({
  itemIds: z.array(z.string().trim().min(1)).min(1),
})

// New combined schema that accepts both formats
export const bodegaAssignmentCombinedSchema = assignItemsCombinedSchema

const costoPromedioSchema = nonNegativeNumberSchema.refine(
  (value) => Math.round(value * 100) === value * 100,
  "MAX_2_DECIMALS",
)

export const bodegaItemsQuerySchema = paginationSchema

export const bodegaItemUpdateSchema = z.object({
  stockMinimo: nonNegativeNumberSchema.optional(),
  stockActual: nonNegativeNumberSchema.optional(),
  stockMaximo: nonNegativeNumberSchema.optional(),
  costoPromedio: costoPromedioSchema.optional(),
})

export { bodegaCreateSchema, bodegaUpdateSchema }

export type BodegaCreateInput = z.infer<typeof bodegaCreateSchema>
export type BodegaPatchInput = z.infer<typeof bodegaPatchSchema>
export type BodegaListQuery = z.infer<typeof bodegaListQuerySchema>
export type BodegaAssignmentInput = z.infer<typeof bodegaAssignmentSchema>
export type BodegaItemsQuery = z.infer<typeof bodegaItemsQuerySchema>
export type BodegaItemUpdateInput = z.infer<typeof bodegaItemUpdateSchema>
