import { z } from "zod"
import { idSchema, nonNegativeNumberSchema } from "@/lib/validations/common"

/**
 * Schema for a single item assignment with optional stock and cost
 */
export const assignItemInputSchema = z.object({
  itemId: idSchema,
  stockInicial: nonNegativeNumberSchema.optional().default(0),
  costoUnitario: nonNegativeNumberSchema.optional().default(0),
})

/**
 * Schema for assigning multiple items to a bodega
 * Supports both new format (items array) and legacy format (itemIds array)
 */
export const assignItemsRequestSchema = z.object({
  items: z.array(assignItemInputSchema)
    .min(1, "Debe incluir al menos un item")
    .max(50, "Máximo 50 items por operación"),
})

/**
 * Legacy schema for backwards compatibility
 * Converts itemIds array to items array with default stock/cost
 */
export const assignItemsLegacyRequestSchema = z.object({
  itemIds: z.array(idSchema)
    .min(1, "Debe incluir al menos un item")
    .max(50, "Máximo 50 items por operación"),
})

/**
 * Combined schema that accepts both new and legacy formats
 */
export const assignItemsCombinedSchema = z.union([
  assignItemsRequestSchema,
  assignItemsLegacyRequestSchema.transform((data) => ({
    items: data.itemIds.map((itemId) => ({
      itemId,
      stockInicial: 0,
      costoUnitario: 0,
    })),
  })),
])

// Type exports
export type AssignItemInput = z.infer<typeof assignItemInputSchema>
export type AssignItemsRequest = z.infer<typeof assignItemsRequestSchema>
export type AssignItemsLegacyRequest = z.infer<typeof assignItemsLegacyRequestSchema>
