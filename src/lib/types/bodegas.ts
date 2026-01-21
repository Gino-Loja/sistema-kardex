import type { Bodega } from "@/lib/dal/repositories/bodegas.repository"

export type BodegaListResult = {
  items: Bodega[]
  total: number
}

export type BodegaFormValues = {
  identificacion: string
  nombre: string
  ubicacion?: string
  estado?: string
}

export type BodegaDetailItem = {
  id: string
  itemId: string
  codigo: string
  nombre: string
  estado: string
  stockActual: number
  stockMinimo?: number | null
  stockMaximo?: number | null
  costoPromedio: number
}

export type BodegaItemsPage = {
  items: BodegaDetailItem[]
  page: number
  pageSize: number
  total: number
}

export type BodegaItemUpdateInput = {
  stockMinimo?: number | null
  stockActual?: number | null
  stockMaximo?: number | null
  costoPromedio?: number | null
}

export type BodegaDetail = Bodega & {
  items: BodegaDetailItem[]
}

// Types for item assignment with automatic movement creation
export type AssignItemsSuccessResponse = {
  success: true
  data: {
    assigned: string[]
    movimientoId: string | null
    message: string
  }
}

export type AssignItemsErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    details?: {
      itemsYaAsignados?: string[]
      bodegaInactiva?: boolean
      itemsInexistentes?: string[]
    }
  }
}

export type AssignItemsResponse = AssignItemsSuccessResponse | AssignItemsErrorResponse
