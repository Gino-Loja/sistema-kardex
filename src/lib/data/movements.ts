import { randomUUID } from "crypto"
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle/db"
import {
  movimientos,
  detalleMovimientos,
  bodegas,
  items,
  terceros,
  user,
  itemBodegas,
} from "@/lib/drizzle/schema"
import type { MovementListQuery, MovementCreateInput, MovementUpdateInput, MovementDetailInput } from "@/lib/validators/movement"

export type MovementWithDetails = {
  id: string
  tipo: string
  estado: string
  fecha: Date
  bodegaOrigen: { id: string; nombre: string } | null
  bodegaDestino: { id: string; nombre: string } | null
  tercero: { id: string; nombre: string } | null
  usuario: { id: string; name: string }
  documentoReferencia: string | null
  observacion: string | null
  detalles: Array<{
    id: string
    item: { id: string; codigo: string; nombre: string }
    cantidad: number
    costoUnitario: number | null
    costoTotal: number | null
  }>
  totalEstimado: number
  creadoEn: Date
  actualizadoEn: Date
  version: number | null
}

export type MovementSummary = {
  id: string
  tipo: string
  estado: string
  fecha: Date
  bodegaOrigen: { id: string; nombre: string } | null
  bodegaDestino: { id: string; nombre: string } | null
  tercero: { id: string; nombre: string } | null
  totalEstimado: number
  cantidadItems: number
}

export const listMovements = async (query: MovementListQuery) => {
  const { page, pageSize, tipo, estado, fechaDesde, fechaHasta, search } = query
  const offset = (page - 1) * pageSize

  const conditions = []

  if (tipo) {
    conditions.push(eq(movimientos.tipo, tipo))
  }

  if (estado) {
    conditions.push(eq(movimientos.estado, estado))
  }

  if (fechaDesde) {
    conditions.push(gte(movimientos.fecha, fechaDesde))
  }

  if (fechaHasta) {
    conditions.push(lte(movimientos.fecha, fechaHasta))
  }

  if (search) {
    conditions.push(
      or(
        ilike(movimientos.observacion, `%${search}%`),
      )
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const rawItems = await db
    .select({
      id: movimientos.id,
      tipo: movimientos.tipo,
      estado: movimientos.estado,
      fecha: movimientos.fecha,
      bodegaOrigenId: movimientos.bodegaOrigenId,
      bodegaDestinoId: movimientos.bodegaDestinoId,
      terceroId: movimientos.terceroId,
      observacion: movimientos.observacion,
      creadoEn: movimientos.creadoEn,
      actualizadoEn: movimientos.actualizadoEn,
    })
    .from(movimientos)
    .where(whereClause)
    .orderBy(desc(movimientos.fecha))
    .limit(pageSize)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(movimientos)
    .where(whereClause)

  // Enrich with related data
  const enrichedItems: MovementSummary[] = await Promise.all(
    rawItems.map(async (mov) => {
      // Get bodega origen
      let bodegaOrigen = null
      if (mov.bodegaOrigenId) {
        const [b] = await db
          .select({ id: bodegas.id, nombre: bodegas.nombre })
          .from(bodegas)
          .where(eq(bodegas.id, mov.bodegaOrigenId))
          .limit(1)
        bodegaOrigen = b ?? null
      }

      // Get bodega destino
      let bodegaDestino = null
      if (mov.bodegaDestinoId) {
        const [b] = await db
          .select({ id: bodegas.id, nombre: bodegas.nombre })
          .from(bodegas)
          .where(eq(bodegas.id, mov.bodegaDestinoId))
          .limit(1)
        bodegaDestino = b ?? null
      }

      // Get tercero
      let tercero = null
      if (mov.terceroId) {
        const [t] = await db
          .select({ id: terceros.id, nombre: terceros.nombre })
          .from(terceros)
          .where(eq(terceros.id, mov.terceroId))
          .limit(1)
        tercero = t ?? null
      }

      // Get detalles for totals
      const detalles = await db
        .select({
          costoTotal: detalleMovimientos.costoTotal,
        })
        .from(detalleMovimientos)
        .where(eq(detalleMovimientos.movimientoId, mov.id))

      const totalEstimado = detalles.reduce(
        (sum, d) => sum + (d.costoTotal ?? 0),
        0
      )

      return {
        id: mov.id,
        tipo: mov.tipo,
        estado: mov.estado,
        fecha: mov.fecha,
        bodegaOrigen,
        bodegaDestino,
        tercero,
        totalEstimado,
        cantidadItems: detalles.length,
      }
    })
  )

  return {
    items: enrichedItems,
    total: Number(count),
    page,
    pageSize,
  }
}

export const getMovementById = async (id: string): Promise<MovementWithDetails | null> => {
  const [mov] = await db
    .select()
    .from(movimientos)
    .where(eq(movimientos.id, id))
    .limit(1)

  if (!mov) {
    return null
  }

  // Get bodega origen
  let bodegaOrigen = null
  if (mov.bodegaOrigenId) {
    const [b] = await db
      .select({ id: bodegas.id, nombre: bodegas.nombre })
      .from(bodegas)
      .where(eq(bodegas.id, mov.bodegaOrigenId))
      .limit(1)
    bodegaOrigen = b ?? null
  }

  // Get bodega destino
  let bodegaDestino = null
  if (mov.bodegaDestinoId) {
    const [b] = await db
      .select({ id: bodegas.id, nombre: bodegas.nombre })
      .from(bodegas)
      .where(eq(bodegas.id, mov.bodegaDestinoId))
      .limit(1)
    bodegaDestino = b ?? null
  }

  // Get tercero
  let tercero = null
  if (mov.terceroId) {
    const [t] = await db
      .select({ id: terceros.id, nombre: terceros.nombre })
      .from(terceros)
      .where(eq(terceros.id, mov.terceroId))
      .limit(1)
    tercero = t ?? null
  }

  // Get usuario
  const [usuario] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.id, mov.usuarioId))
    .limit(1)

  // Get detalles with item info
  const rawDetalles = await db
    .select({
      id: detalleMovimientos.id,
      itemId: detalleMovimientos.itemId,
      cantidad: detalleMovimientos.cantidad,
      costoUnitario: detalleMovimientos.costoUnitario,
      costoTotal: detalleMovimientos.costoTotal,
    })
    .from(detalleMovimientos)
    .where(eq(detalleMovimientos.movimientoId, mov.id))

  const detalles = await Promise.all(
    rawDetalles.map(async (d) => {
      const [item] = await db
        .select({ id: items.id, codigo: items.codigo, nombre: items.nombre })
        .from(items)
        .where(eq(items.id, d.itemId))
        .limit(1)

      return {
        id: d.id,
        item: item ?? { id: d.itemId, codigo: "", nombre: "" },
        cantidad: d.cantidad,
        costoUnitario: d.costoUnitario,
        costoTotal: d.costoTotal,
      }
    })
  )

  const totalEstimado = detalles.reduce(
    (sum, d) => sum + (d.costoTotal ?? 0),
    0
  )

  return {
    id: mov.id,
    tipo: mov.tipo,
    estado: mov.estado,
    fecha: mov.fecha,
    bodegaOrigen,
    bodegaDestino,
    tercero,
    usuario: usuario ?? { id: mov.usuarioId, name: "" },
    documentoReferencia: null,
    observacion: mov.observacion,
    detalles,
    totalEstimado,
    creadoEn: mov.creadoEn,
    actualizadoEn: mov.actualizadoEn,
    version: Number(mov.version),
  }
}

export type StockValidationResult = {
  valid: boolean
  errors: Array<{
    itemId: string
    itemName: string
    requested: number
    available: number
  }>
}

export const validateStock = async (
  bodegaId: string,
  detalles: MovementDetailInput[]
): Promise<StockValidationResult> => {
  const errors: StockValidationResult["errors"] = []

  for (const detalle of detalles) {
    const [stockRecord] = await db
      .select({
        stockActual: itemBodegas.stockActual,
      })
      .from(itemBodegas)
      .where(
        and(
          eq(itemBodegas.itemId, detalle.itemId),
          eq(itemBodegas.bodegaId, bodegaId)
        )
      )
      .limit(1)

    const available = stockRecord?.stockActual ?? 0

    if (available < detalle.cantidad) {
      const [item] = await db
        .select({ nombre: items.nombre })
        .from(items)
        .where(eq(items.id, detalle.itemId))
        .limit(1)

      errors.push({
        itemId: detalle.itemId,
        itemName: item?.nombre ?? detalle.itemId,
        requested: detalle.cantidad,
        available,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const createMovement = async (
  input: MovementCreateInput,
  usuarioId: string
): Promise<MovementWithDetails> => {
  // Validate stock for salida and transferencia types
  if ((input.tipo === "salida" || input.tipo === "transferencia") && input.bodegaOrigenId) {
    const stockValidation = await validateStock(input.bodegaOrigenId, input.detalles)
    if (!stockValidation.valid) {
      const errorDetails = stockValidation.errors
        .map((e) => `${e.itemName}: solicitado ${e.requested}, disponible ${e.available}`)
        .join("; ")
      throw new Error(`STOCK_INSUFFICIENT: ${errorDetails}`)
    }
  }

  const movimientoId = randomUUID()

  const detallesParaInsertar = input.detalles.map((detalle) => ({
    id: randomUUID(),
    movimientoId,
    itemId: detalle.itemId,
    cantidad: detalle.cantidad,
    costoUnitario: detalle.costoUnitario ?? null,
    costoTotal: detalle.costoUnitario
      ? detalle.cantidad * detalle.costoUnitario
      : null,
  }))

  await db.transaction(async (tx) => {
    await tx.insert(movimientos).values({
      id: movimientoId,
      tipo: input.tipo,
      estado: "borrador",
      fecha: input.fecha,
      bodegaOrigenId: input.bodegaOrigenId ?? null,
      bodegaDestinoId: input.bodegaDestinoId ?? null,
      terceroId: input.terceroId ?? null,
      observacion: input.observacion ?? null,
      usuarioId,
    })

    if (detallesParaInsertar.length > 0) {
      await tx.insert(detalleMovimientos).values(detallesParaInsertar)
    }
  })

  const result = await getMovementById(movimientoId)
  if (!result) {
    throw new Error("MOVEMENT_NOT_FOUND_AFTER_CREATE")
  }

  return result
}

export const updateMovement = async (
  id: string,
  input: MovementUpdateInput
): Promise<MovementWithDetails> => {
  // Check if movement exists and is editable
  const existing = await getMovementById(id)
  if (!existing) {
    throw new Error("NOT_FOUND")
  }

  if (existing.estado !== "borrador") {
    throw new Error("NOT_EDITABLE")
  }

  // Optimistic concurrency check
  if (input.version && existing.version !== input.version) {
    throw new Error("CONCURRENCY_ERROR")
  }

  await db.transaction(async (tx) => {
    // Update main movement record
    const updateData: Record<string, unknown> = {
      actualizadoEn: new Date(),
      version: (existing.version ?? 1) + 1,
    }

    if (input.tipo !== undefined) updateData.tipo = input.tipo
    if (input.fecha !== undefined) updateData.fecha = input.fecha
    if (input.bodegaOrigenId !== undefined) updateData.bodegaOrigenId = input.bodegaOrigenId
    if (input.bodegaDestinoId !== undefined) updateData.bodegaDestinoId = input.bodegaDestinoId
    if (input.terceroId !== undefined) updateData.terceroId = input.terceroId
    if (input.observacion !== undefined) updateData.observacion = input.observacion

    await tx
      .update(movimientos)
      .set(updateData)
      .where(eq(movimientos.id, id))

    // Update detalles if provided
    if (input.detalles) {
      // Delete existing detalles
      await tx
        .delete(detalleMovimientos)
        .where(eq(detalleMovimientos.movimientoId, id))

      // Insert new detalles
      const detallesParaInsertar = input.detalles.map((detalle) => ({
        id: randomUUID(),
        movimientoId: id,
        itemId: detalle.itemId,
        cantidad: detalle.cantidad,
        costoUnitario: detalle.costoUnitario ?? null,
        costoTotal: detalle.costoUnitario
          ? detalle.cantidad * detalle.costoUnitario
          : null,
      }))

      if (detallesParaInsertar.length > 0) {
        await tx.insert(detalleMovimientos).values(detallesParaInsertar)
      }
    }
  })

  const result = await getMovementById(id)
  if (!result) {
    throw new Error("NOT_FOUND")
  }

  return result
}

export const deleteMovement = async (id: string): Promise<void> => {
  // Check if movement exists and is deletable
  const existing = await getMovementById(id)
  if (!existing) {
    throw new Error("NOT_FOUND")
  }

  if (existing.estado !== "borrador") {
    throw new Error("NOT_DELETABLE")
  }

  await db.transaction(async (tx) => {
    // Delete detalles first
    await tx
      .delete(detalleMovimientos)
      .where(eq(detalleMovimientos.movimientoId, id))

    // Delete movement
    await tx
      .delete(movimientos)
      .where(eq(movimientos.id, id))
  })
}