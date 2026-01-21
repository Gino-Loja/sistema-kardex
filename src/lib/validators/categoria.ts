import { z } from "zod"
import { categoriaCreateSchema, categoriaUpdateSchema } from "@/lib/validations/masters"

export const categoriaPatchSchema = categoriaUpdateSchema.omit({ id: true })

export { categoriaCreateSchema, categoriaUpdateSchema }

export type CategoriaCreateInput = z.infer<typeof categoriaCreateSchema>
export type CategoriaPatchInput = z.infer<typeof categoriaPatchSchema>
