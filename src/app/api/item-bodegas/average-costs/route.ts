import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { getAverageCosts } from "@/lib/data/item-bodegas"
import type { AverageCostsResponse, MovementErrorResponse } from "@/lib/types/movements"

const errorResponse = (
  code: string,
  message: string,
  status: number
): NextResponse<MovementErrorResponse> =>
  NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  )

const requireReadPermission = async () => {
  try {
    const session = await getAuthSession()
    const user = requirePermission(session, "movements:read")
    return { user, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", "No tiene permisos para esta acción", 403) }
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", "Sesión no válida", 401) }
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<AverageCostsResponse | MovementErrorResponse>> {
  const { error } = await requireReadPermission()
  if (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const bodegaId = searchParams.get("bodegaId")
  const itemIdsParam = searchParams.get("itemIds")

  if (!bodegaId) {
    return errorResponse("VALIDATION_ERROR", "bodegaId es requerido", 400)
  }

  if (!itemIdsParam) {
    return errorResponse("VALIDATION_ERROR", "itemIds es requerido", 400)
  }

  const itemIds = itemIdsParam.split(",").map((id) => id.trim()).filter((id) => id.length > 0)

  if (itemIds.length === 0) {
    return errorResponse("VALIDATION_ERROR", "itemIds debe contener al menos un ID", 400)
  }

  try {
    const costs = await getAverageCosts(bodegaId, itemIds)

    return NextResponse.json({
      success: true,
      data: {
        bodegaId,
        costs,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_FAILED"

    if (message === "BODEGA_NOT_FOUND") {
      return errorResponse("NOT_FOUND", "Bodega no encontrada", 404)
    }

    return errorResponse("FETCH_FAILED", message, 500)
  }
}
