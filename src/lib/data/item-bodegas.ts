import { randomUUID } from "crypto"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle/db"
import { bodegas, itemBodegas, items, movimientos, detalleMovimientos } from "@/lib/drizzle/schema"
import { bodegasRepository } from "@/lib/dal/repositories/bodegas.repository"
import { itemBodegasRepository } from "@/lib/dal/repositories/item-bodegas.repository"
import { movimientosRepository } from "@/lib/dal/repositories/movimientos.repository"
import { auditoriaCostoRepository } from "@/lib/dal/repositories/auditoria-costo.repository"
import { itemsRepository } from "@/lib/dal/repositories/items.repository"
import { createMovementsService } from "@/lib/dal/services/movements.service"
import { createAuditLogService } from "@/lib/dal/services/audit-log.service"
import type { BodegaDetailItem, BodegaItemUpdateInput, BodegaItemsPage, AssignItemsSuccessResponse } from "@/lib/types/bodegas"
import type { AverageCostItem } from "@/lib/types/movements"
import type { AssignItemInput } from "@/lib/validators/item-bodega"

// Create a no-op audit log service for item assignment operations
const auditLogService = createAuditLogService({
  create: async (input) => ({
    id: input.id ?? randomUUID(),
    ...input,
  }),
})

export const listItemsByBodega = async (
  bodegaId: string,
  input?: { page?: number; pageSize?: number },
): Promise<BodegaItemsPage> => {
  const page = input?.page ?? 1
  const pageSize = input?.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const [totalRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(itemBodegas)
    .where(eq(itemBodegas.bodegaId, bodegaId))

  const itemsPage = await db
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
    .where(eq(itemBodegas.bodegaId, bodegaId))
    .orderBy(asc(items.codigo))
    .limit(pageSize)
    .offset(offset)

  return {
    items: itemsPage,
    page,
    pageSize,
    total: totalRow?.total ?? 0,
  }
}

/**
 * Assigns items to a bodega with optional initial stock and cost.
 * When items have stockInicial > 0, automatically creates and publishes
 * an entry movement so the kardex reflects the inventory correctly.
 *
 * @param bodegaId - Target bodega ID
 * @param items - Array of items with optional stockInicial and costoUnitario
 * @param usuarioId - User ID for movement creation (required if any item has stock > 0)
 * @returns AssignItemsSuccessResponse with assigned items and optional movimientoId
 */
export const assignItemsToBodega = async ({
  bodegaId,
  items: itemsInput,
  usuarioId,
}: {
  bodegaId: string
  items: AssignItemInput[]
  usuarioId?: string
}): Promise<AssignItemsSuccessResponse["data"]> => {
  // Validate bodega exists and is active
  const bodega = await bodegasRepository.obtenerPorId(bodegaId)
  if (!bodega) {
    throw new Error("BODEGA_NOT_FOUND")
  }
  if (bodega.estado === "inactivo") {
    throw new Error("BODEGA_INACTIVE")
  }

  // Normalize and deduplicate items
  const normalizedItems = itemsInput
    .map((item) => ({
      itemId: item.itemId.trim(),
      stockInicial: item.stockInicial ?? 0,
      costoUnitario: item.costoUnitario ?? 0,
    }))
    .filter((item) => item.itemId.length > 0)

  // Deduplicate by itemId, keeping the first occurrence
  const uniqueItemsMap = new Map<string, typeof normalizedItems[0]>()
  for (const item of normalizedItems) {
    if (!uniqueItemsMap.has(item.itemId)) {
      uniqueItemsMap.set(item.itemId, item)
    }
  }
  const uniqueItems = Array.from(uniqueItemsMap.values())
  const uniqueIds = uniqueItems.map((item) => item.itemId)

  if (uniqueIds.length === 0) {
    throw new Error("ITEMS_REQUIRED")
  }

  // Validate all items exist
  const existingItems = await db
    .select({ id: items.id, estado: items.estado })
    .from(items)
    .where(inArray(items.id, uniqueIds))

  if (existingItems.length !== uniqueIds.length) {
    const foundIds = new Set(existingItems.map((item) => item.id))
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id))
    const error = new Error("ITEMS_NOT_FOUND") as Error & { details?: { itemsInexistentes: string[] } }
    error.details = { itemsInexistentes: missingIds }
    throw error
  }

  // Validate no inactive items
  const inactiveItem = existingItems.find((item) => item.estado === "inactivo")
  if (inactiveItem) {
    throw new Error("ITEM_INACTIVE")
  }

  // Check for items already assigned to this bodega
  const existingAssignments = await db
    .select({ itemId: itemBodegas.itemId })
    .from(itemBodegas)
    .where(and(eq(itemBodegas.bodegaId, bodegaId), inArray(itemBodegas.itemId, uniqueIds)))

  if (existingAssignments.length > 0) {
    const alreadyAssigned = existingAssignments.map((a) => a.itemId)
    const error = new Error("ITEMS_ALREADY_ASSIGNED") as Error & { details?: { itemsYaAsignados: string[] } }
    error.details = { itemsYaAsignados: alreadyAssigned }
    throw error
  }

  // Separate items with and without initial stock
  const itemsWithStock = uniqueItems.filter((item) => item.stockInicial > 0)
  const needsMovement = itemsWithStock.length > 0

  // Require usuarioId if we need to create a movement
  if (needsMovement && !usuarioId) {
    throw new Error("USUARIO_REQUIRED_FOR_STOCK")
  }

  let movimientoId: string | null = null

  // Execute everything in a transaction for atomicity
  await db.transaction(async (tx) => {
    // 1. Create item_bodegas records for all items
    for (const item of uniqueItems) {
      await tx.insert(itemBodegas).values({
        id: randomUUID(),
        itemId: item.itemId,
        bodegaId,
        stockActual: 0, // Will be updated by publicarMovimiento if stock > 0
        costoPromedio: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        // Guardar el saldo inicial histórico para el Kardex
        stockInicial: item.stockInicial > 0 ? item.stockInicial : null,
        costoInicial: item.stockInicial > 0 ? item.costoUnitario : null,
      })
    }

    // 2. Create and publish movement if any item has stock > 0
    if (needsMovement && usuarioId) {
      movimientoId = randomUUID()

      // Crear fecha con hora del mediodía para evitar problemas de zona horaria
      const now = new Date()
      const fechaMovimiento = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)

      // Create movement in "borrador" state
      await tx.insert(movimientos).values({
        id: movimientoId,
        tipo: "entrada",
        estado: "borrador",
        fecha: fechaMovimiento,
        bodegaDestinoId: bodegaId,
        bodegaOrigenId: null,
        terceroId: null,
        observacion: `Asignación inicial de ${itemsWithStock.length} item(s) a bodega`,
        usuarioId,
      })

      // Create movement details for items with stock > 0
      const detalles = itemsWithStock.map((item) => ({
        id: randomUUID(),
        movimientoId: movimientoId!,
        itemId: item.itemId,
        cantidad: item.stockInicial,
        costoUnitario: item.costoUnitario,
        costoTotal: item.stockInicial * item.costoUnitario,
      }))

      if (detalles.length > 0) {
        await tx.insert(detalleMovimientos).values(detalles)
      }
    }
  })

  // 3. Publish the movement (outside transaction to use the service)
  if (movimientoId && usuarioId) {
    const movementsService = createMovementsService({
      movimientosRepository,
      itemBodegaRepository: itemBodegasRepository,
      itemsRepository,
      auditLogService,
      auditoriaCostoRepository,
      bodegasRepository,
    })

    await movementsService.publicarMovimiento({
      movimientoId,
      usuarioId,
    })
  }

  // Build response message
  const itemCount = uniqueIds.length
  let message: string
  if (needsMovement) {
    message = `${itemCount} item${itemCount > 1 ? "s" : ""} asignado${itemCount > 1 ? "s" : ""}. Movimiento de entrada creado y publicado.`
  } else {
    message = `${itemCount} item${itemCount > 1 ? "s" : ""} asignado${itemCount > 1 ? "s" : ""}. No se creó movimiento (stock inicial = 0).`
  }

  return {
    assigned: uniqueIds,
    movimientoId,
    message,
  }
}

/**
 * Legacy wrapper for backwards compatibility.
 * Converts itemIds array to new format and calls assignItemsToBodega.
 */
export const assignItemsToBodegaLegacy = async ({
  bodegaId,
  itemIds,
}: {
  bodegaId: string
  itemIds: string[]
}) => {
  const items = itemIds.map((itemId) => ({
    itemId,
    stockInicial: 0,
    costoUnitario: 0,
  }))

  const result = await assignItemsToBodega({ bodegaId, items })

  // Return legacy format for backwards compatibility
  return { assigned: result.assigned }
}

export const updateAssignedItem = async ({
  bodegaId,
  itemId,
  input,
}: {
  bodegaId: string
  itemId: string
  input: BodegaItemUpdateInput
}): Promise<BodegaDetailItem> => {
  await itemBodegasRepository.actualizar(itemId, bodegaId, {
    stockActual: input.stockActual ?? undefined,
    stockMinimo: input.stockMinimo ?? undefined,
    stockMaximo: input.stockMaximo ?? undefined,
    costoPromedio: input.costoPromedio ?? undefined,
  })

  const [updated] = await db
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
    .where(and(eq(itemBodegas.bodegaId, bodegaId), eq(itemBodegas.itemId, itemId)))
    .limit(1)

  if (!updated) {
    throw new Error("NOT_FOUND")
  }

  return updated
}

export const deleteAssignedItem = async (bodegaId: string, itemId: string) => {
  await itemBodegasRepository.eliminar(itemId, bodegaId)
}

/**
 * Obtiene los costos promedio de múltiples ítems en una bodega específica.
 * Retorna un objeto con los costos indexados por itemId.
 * Para ítems sin registro, retorna valores en 0.
 */
export const getAverageCosts = async (
  bodegaId: string,
  itemIds: string[]
): Promise<Record<string, AverageCostItem>> => {
  const uniqueIds = Array.from(new Set(itemIds.filter((id) => id.trim().length > 0)))

  if (uniqueIds.length === 0) {
    return {}
  }

  const bodega = await bodegasRepository.obtenerPorId(bodegaId)
  if (!bodega) {
    throw new Error("BODEGA_NOT_FOUND")
  }

  const registros = await db
    .select({
      itemId: itemBodegas.itemId,
      costoPromedio: itemBodegas.costoPromedio,
      cantidad: itemBodegas.stockActual,
      stockMinimo: itemBodegas.stockMinimo,
    })
    .from(itemBodegas)
    .where(
      and(
        eq(itemBodegas.bodegaId, bodegaId),
        inArray(itemBodegas.itemId, uniqueIds)
      )
    )

  const costs: Record<string, AverageCostItem> = {}

  for (const id of uniqueIds) {
    const registro = registros.find((r) => r.itemId === id)
    if (registro) {
      const costoPromedio = Number(registro.costoPromedio) || 0
      const cantidad = Number(registro.cantidad) || 0
      const stockMinimo = registro.stockMinimo != null ? Number(registro.stockMinimo) : null
      costs[id] = {
        costoPromedio,
        cantidad,
        valorTotal: costoPromedio * cantidad,
        stockMinimo,
      }
    } else {
      costs[id] = {
        costoPromedio: 0,
        cantidad: 0,
        valorTotal: 0,
        stockMinimo: null,
      }
    }
  }

  return costs
}
