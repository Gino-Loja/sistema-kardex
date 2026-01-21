import { and, asc, eq, ilike, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle/db"
import { terceros } from "@/lib/drizzle/schema"
import { tercerosRepository } from "@/lib/dal/repositories/terceros.repository"
import type { TerceroListFilters, TerceroListResult } from "@/lib/types/terceros"

export const listTerceros = async (
  filters: TerceroListFilters,
): Promise<TerceroListResult> => {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const offset = (page - 1) * pageSize
  const conditions: Array<ReturnType<typeof eq>> = []

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(ilike(terceros.nombre, term))
  }

  if (filters.tipo) {
    conditions.push(eq(terceros.tipo, filters.tipo))
  }

  if (filters.estado && filters.estado !== "todos") {
    conditions.push(eq(terceros.estado, filters.estado))
  } else if (!filters.estado) {
    conditions.push(eq(terceros.estado, "activo"))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  const items = await db
    .select()
    .from(terceros)
    .where(whereClause)
    .orderBy(asc(terceros.nombre))
    .limit(pageSize)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(terceros)
    .where(whereClause)

  return {
    items,
    total: Number(count),
    page,
    pageSize,
  }
}

export const getTerceroById = async (id: string) => {
  return tercerosRepository.obtenerPorId(id)
}

export const createTercero = async (
  input: Parameters<typeof tercerosRepository.crear>[0],
) => {
  return tercerosRepository.crear(input)
}

export const updateTercero = async (
  id: string,
  input: Parameters<typeof tercerosRepository.actualizar>[1],
) => {
  return tercerosRepository.actualizar(id, input)
}

export const deleteTercero = async (id: string) => {
  return tercerosRepository.desactivar(id)
}
