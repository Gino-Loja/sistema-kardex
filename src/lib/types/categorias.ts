import type { Categoria } from "@/lib/dal/repositories/categorias.repository"

export type CategoriaListResult = {
  items: Categoria[]
  total: number
}

export type CategoriaFormValues = {
  nombre: string
  descripcion?: string
  estado?: string
}
