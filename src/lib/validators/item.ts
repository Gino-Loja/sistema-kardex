import { z } from "zod"
import { estadoSchema, paginationSchema } from "@/lib/validations/common"
import { itemCreateSchema, itemUpdateSchema } from "@/lib/validations/masters"

export const itemPatchSchema = itemUpdateSchema.omit({ id: true })

export const itemListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  status: estadoSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export { itemCreateSchema, itemUpdateSchema }

export type ItemCreateInput = z.infer<typeof itemCreateSchema>
export type ItemPatchInput = z.infer<typeof itemPatchSchema>
export type ItemListQuery = z.infer<typeof itemListQuerySchema>
