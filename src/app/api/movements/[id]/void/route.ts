import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { anularMovimiento } from "@/lib/actions/movements"
import type { VoidMovementResponse, MovementErrorResponse } from "@/lib/types/movements"

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
): Promise<NextResponse<VoidMovementResponse | MovementErrorResponse>> {
  const { error } = await requireMovementsPermission()
  if (error) {
    return error
  }

  const { id } = await context.params

  try {
    const result = await anularMovimiento({
      movimientoId: id,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        estado: "anulado" as const,
        updatedAt: result.actualizadoEn?.toISOString() ?? new Date().toISOString(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "VOID_FAILED"

    if (message === "NOT_FOUND" || message === "MOVIMIENTO_NO_ENCONTRADO") {
      return errorResponse("NOT_FOUND", "Movimiento no encontrado", 404)
    }

    if (message === "NOT_VOIDABLE" || message === "MOVIMIENTO_NO_PUBLICADO") {
      return errorResponse("NOT_VOIDABLE", "Solo se pueden anular movimientos publicados", 409)
    }

    return errorResponse("VOID_FAILED", message, 500)
  }
}
