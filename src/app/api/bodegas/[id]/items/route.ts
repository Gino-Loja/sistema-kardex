import { NextResponse } from "next/server"

import { getBodegaById } from "@/lib/data/bodegas"
import { assignItemsToBodega, listItemsByBodega } from "@/lib/data/item-bodegas"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { bodegaAssignmentCombinedSchema, bodegaItemsQuerySchema } from "@/lib/validators/bodega"

const errorResponse = (message: string, status = 400, details?: Record<string, unknown>) =>
  NextResponse.json({ error: message, ...(details && { details }) }, { status })

const requireMastersPermission = async (permission: "masters:read" | "masters:write") => {
  try {
    const session = await getAuthSession()
    requirePermission(session, permission)
    return { error: null, session }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return { error: errorResponse("FORBIDDEN", 403), session: null }
    }
    return { error: errorResponse("UNAUTHENTICATED", 401), session: null }
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { searchParams } = new URL(request.url)
  const parsedQuery = bodegaItemsQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsedQuery.success) {
    return errorResponse("PARAMS_INVALID")
  }

  const { id } = await context.params
  const bodega = await getBodegaById(id)
  if (!bodega) {
    return errorResponse("NOT_FOUND", 404)
  }

  const items = await listItemsByBodega(id, parsedQuery.data)

  return NextResponse.json(items)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error: authError, session } = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const body = await request.json().catch(() => null)
  const parsed = bodegaAssignmentCombinedSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const { id } = await context.params

  try {
    const result = await assignItemsToBodega({
      bodegaId: id,
      items: parsed.data.items,
      usuarioId: session?.user?.id,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "ASSIGN_FAILED"
    const details = (error as Error & { details?: Record<string, unknown> })?.details

    if (message === "BODEGA_NOT_FOUND") {
      return errorResponse("NOT_FOUND", 404)
    }
    if (message === "ITEMS_NOT_FOUND") {
      return errorResponse("ITEMS_NOT_FOUND", 404, details)
    }
    if (message === "ITEM_NOT_FOUND") {
      return errorResponse("ITEM_NOT_FOUND", 404)
    }
    if (message === "ITEM_INACTIVE") {
      return errorResponse("ITEM_INACTIVE", 409)
    }
    if (message === "ITEMS_ALREADY_ASSIGNED") {
      return errorResponse("ITEMS_ALREADY_ASSIGNED", 409, details)
    }
    if (message === "ITEM_ALREADY_ASSIGNED" || message === "DUPLICATE") {
      return errorResponse("ITEM_ALREADY_ASSIGNED", 409)
    }
    if (message === "BODEGA_INACTIVE") {
      return errorResponse("BODEGA_INACTIVE", 409)
    }
    if (message === "ITEMS_REQUIRED") {
      return errorResponse("ITEMS_REQUIRED")
    }
    if (message === "USUARIO_REQUIRED_FOR_STOCK") {
      return errorResponse("USUARIO_REQUIRED_FOR_STOCK", 401)
    }

    return errorResponse("ASSIGN_FAILED", 500)
  }
}
