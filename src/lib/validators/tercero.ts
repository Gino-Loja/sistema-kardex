import { z } from "zod"
import { estadoSchema, paginationSchema } from "@/lib/validations/common"
import {
  terceroCreateSchema,
  terceroTipoSchema,
  terceroUpdateSchema,
} from "@/lib/validations/masters"

export const terceroPatchSchema = terceroUpdateSchema.omit({ id: true })

const terceroEstadoSchema = z.enum(["activo", "inactivo", "todos"])

export const terceroListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  estado: terceroEstadoSchema.optional(),
  tipo: terceroTipoSchema.optional(),
})

export { terceroCreateSchema, terceroUpdateSchema }

export type TerceroCreateInput = z.infer<typeof terceroCreateSchema>
export type TerceroPatchInput = z.infer<typeof terceroPatchSchema>
export type TerceroListQuery = z.infer<typeof terceroListQuerySchema>
