import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle/db"
import { itemBodegas, items } from "@/lib/drizzle/schema"
import { bodegasRepository } from "@/lib/dal/repositories/bodegas.repository"
import type { BodegaDetail } from "@/lib/types/bodegas"

export const listBodegas = async (input?: { page?: number; pageSize?: number }) => {
  return bodegasRepository.listar({
    page: input?.page,
    pageSize: input?.pageSize,
  })
}

export const getBodegaById = async (id: string) => {
  return bodegasRepository.obtenerPorId(id)
}

export const getBodegaDetail = async (id: string): Promise<BodegaDetail | null> => {
  const bodega = await bodegasRepository.obtenerPorId(id)
  if (!bodega) {
    return null
  }

  const assignedItems = await db
    .select({
      id: itemBodegas.id,
      itemId: itemBodegas.itemId,
      bodegaId: itemBodegas.bodegaId,
      stockActual: itemBodegas.stockActual,
      stockMinimo: itemBodegas.stockMinimo,
      stockMaximo: itemBodegas.stockMaximo,
      costoPromedio: itemBodegas.costoPromedio,
      codigo: items.codigo,
      nombre: items.nombre,
      estado: items.estado,
    })
    .from(itemBodegas)
    .innerJoin(items, eq(itemBodegas.itemId, items.id))
    .where(eq(itemBodegas.bodegaId, id))
    .orderBy(asc(items.codigo))

  return {
    ...bodega,
    items: assignedItems,
  }
}

export const createBodega = async (
  input: Parameters<typeof bodegasRepository.crear>[0],
) => {
  return bodegasRepository.crear(input)
}

export const updateBodega = async (
  id: string,
  input: Parameters<typeof bodegasRepository.actualizar>[1],
) => {
  return bodegasRepository.actualizar(id, input)
}

export const deactivateBodega = async (id: string) => {
  return bodegasRepository.desactivar(id)
}

export const deleteBodega = async (id: string) => {
  return bodegasRepository.desactivar(id)
}
