import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { getBodegaById } from "@/lib/data/bodegas"
import { deleteAssignedItem, updateAssignedItem } from "@/lib/data/item-bodegas"
import { bodegaItemUpdateSchema } from "@/lib/validators/bodega"

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireMastersPermission = async (permission: "masters:read" | "masters:write") => {
  try {
    const session = await getAuthSession()
    requirePermission(session, permission)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return errorResponse("FORBIDDEN", 403)
    }
    return errorResponse("UNAUTHENTICATED", 401)
  }

  return null
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const body = await request.json().catch(() => null)
  const parsed = bodegaItemUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const { id, itemId } = await context.params
  const bodega = await getBodegaById(id)
  if (!bodega) {
    return errorResponse("NOT_FOUND", 404)
  }

  const { stockMinimo, stockMaximo } = parsed.data
  if (
    typeof stockMinimo === "number"
    && typeof stockMaximo === "number"
    && stockMaximo < stockMinimo
  ) {
    return errorResponse("STOCK_RANGE_INVALID")
  }

  try {
    const updated = await updateAssignedItem({
      bodegaId: id,
      itemId,
      input: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED"

    if (message === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", 404)
    }

    return errorResponse("UPDATE_FAILED", 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const { id, itemId } = await context.params
  const bodega = await getBodegaById(id)
  if (!bodega) {
    return errorResponse("NOT_FOUND", 404)
  }

  try {
    await deleteAssignedItem(id, itemId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED"

    if (message === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", 404)
    }

    return errorResponse("DELETE_FAILED", 500)
  }
}
