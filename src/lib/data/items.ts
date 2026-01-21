import { and, asc, eq, gte, ilike, lte, or, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle/db"
import { items } from "@/lib/drizzle/schema"
import { itemsRepository } from "@/lib/dal/repositories/items.repository"
import type { ItemListFilters, ItemListResult } from "@/lib/types/items"
import { resolveItemImageUrl } from "@/lib/services/item-image"
import { getCategoriaById } from "@/lib/data/categorias"

export const listItems = async (filters: ItemListFilters): Promise<ItemListResult> => {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const conditions: Array<ReturnType<typeof eq>> = []

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(
      or(
        ilike(items.descripcion, term),
        ilike(items.codigo, term),
        ilike(items.nombre, term),
      )!,
    )
  }

  if (filters.status) {
    conditions.push(eq(items.estado, filters.status))
  }

  if (filters.dateFrom) {
    conditions.push(gte(items.creadoEn, filters.dateFrom))
  }

  if (filters.dateTo) {
    conditions.push(lte(items.creadoEn, filters.dateTo))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  const itemsList = await db
    .select()
    .from(items)
    .where(whereClause)
    .orderBy(asc(items.codigo))
    .limit(pageSize)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .where(whereClause)

  const itemsWithImages = await Promise.all(
    itemsList.map(async (item) => ({
      ...item,
      imagenUrl: await resolveItemImageUrl(item.imagenUrl),
    })),
  )

  return {
    items: itemsWithImages,
    total: Number(count),
    page,
    pageSize,
  }
}

export const getItemById = async (id: string) => {
  const item = await itemsRepository.obtenerPorId(id)
  if (!item) {
    return null
  }

  const categoria = item.categoriaId ? await getCategoriaById(item.categoriaId) : null

  return {
    ...item,
    imagenUrl: await resolveItemImageUrl(item.imagenUrl),
    categoria: categoria?.nombre ?? null,
  }
}

export const createItem = async (input: Parameters<typeof itemsRepository.crear>[0]) => {
  return itemsRepository.crear(input)
}

export const updateItem = async (
  id: string,
  input: Parameters<typeof itemsRepository.actualizar>[1],
) => {
  return itemsRepository.actualizar(id, input)
}

export const deleteItem = async (id: string) => {
  const [deleted] = await db
    .delete(items)
    .where(eq(items.id, id))
    .returning()

  if (!deleted) {
    throw new Error("NOT_FOUND")
  }

  return deleted
}
