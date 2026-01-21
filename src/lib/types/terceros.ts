import type { Tercero } from "@/lib/dal/repositories/terceros.repository"

export type TerceroListFilters = {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  tipo?: string
}

export type TerceroListResult = {
  items: Tercero[]
  page: number
  pageSize: number
  total: number
}

export type TerceroDetail = {
  id: string
  tipo: string
  identificacion: string
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  estado: string
  creadoEn: Date
  actualizadoEn: Date
}

export type TerceroFormValues = {
  tipo: string
  identificacion: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  estado?: string
}
