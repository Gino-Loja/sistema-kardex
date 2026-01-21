import type { Item } from "@/lib/dal/repositories/items.repository"

export type ItemListFilters = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
}

export type ItemListResult = {
  items: Item[]
  page: number
  pageSize: number
  total: number
}

export type ItemDetail = {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string | null
  unidadMedida: string
  estado: string
  costoPromedio: number
  creadoEn: Date
  actualizadoEn: Date
  imagenUrl?: string | null
}

export type ItemFormValues = {
  codigo: string
  nombre: string
  descripcion: string
  unidadMedida: string
  categoriaId?: string | null
  estado?: string
  imagenUrl?: string | null
}
