import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { publicarMovimiento } from "@/lib/actions/movements"
import type { PublishMovementResponse, MovementErrorResponse } from "@/lib/types/movements"

const errorResponse = (
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse<MovementErrorResponse> =>
  NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  )

const requireMovementsPermission = async () => {
  try {
    const session = await getAuthSession()
    const user = requirePermission(session, "movements:write")
    return { user, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", "No tiene permisos para esta acción", 403) }
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", "Sesión no válida", 401) }
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<PublishMovementResponse | MovementErrorResponse>> {
  const { error } = await requireMovementsPermission()
  if (error) {
    return error
  }

  const { id } = await context.params

  try {
    const result = await publicarMovimiento({
      movimientoId: id,
      permitirNegativo: false,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        estado: "publicado" as const,
        updatedAt: result.actualizadoEn?.toISOString() ?? new Date().toISOString(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "PUBLISH_FAILED"

    if (message === "NOT_FOUND" || message === "MOVIMIENTO_NO_ENCONTRADO") {
      return errorResponse("NOT_FOUND", "Movimiento no encontrado", 404)
    }

    if (message === "NOT_EDITABLE" || message === "MOVIMIENTO_NO_BORRADOR") {
      return errorResponse("NOT_EDITABLE", "Solo se pueden publicar movimientos en borrador", 409)
    }

    if (message.includes("STOCK_INSUFICIENTE") || message.includes("Stock insuficiente")) {
      const match = message.match(/Stock insuficiente para (.+)/)
      const itemName = match?.[1] ?? "ítem"
      return errorResponse("STOCK_INSUFFICIENT", `Stock insuficiente para ${itemName}`, 422)
    }

    return errorResponse("PUBLISH_FAILED", message, 500)
  }
}
