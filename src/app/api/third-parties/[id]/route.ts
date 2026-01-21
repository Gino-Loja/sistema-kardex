import { NextResponse } from "next/server"

import { deleteTercero, getTerceroById, updateTercero } from "@/lib/data/terceros"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission, requireRole } from "@/lib/auth/guards"
import { terceroPatchSchema } from "@/lib/validators/tercero"

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireMastersPermission = async (
  permission: "masters:read" | "masters:write",
  options?: { adminOnly?: boolean },
) => {
  try {
    const session = await getAuthSession()
    if (options?.adminOnly) {
      requireRole(session, "admin")
    }
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const tercero = await getTerceroById(id)

  if (!tercero) {
    return errorResponse("NOT_FOUND", 404)
  }

  return NextResponse.json(tercero)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write", { adminOnly: true })
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getTerceroById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  const body = await request.json().catch(() => null)
  const parsed = terceroPatchSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const hasFields = Object.values(parsed.data).some((value) => value !== undefined)
  if (!hasFields) {
    return errorResponse("NO_CHANGES")
  }

  try {
    const updated = await updateTercero(id, parsed.data)

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED"
    if (message.includes("terceros_tipo_identificacion_idx") || message.includes("duplicate")) {
      return errorResponse("IDENTIFICATION_EXISTS", 409)
    }
    return errorResponse("UPDATE_FAILED", 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write", { adminOnly: true })
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getTerceroById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  try {
    const deleted = await deleteTercero(id)

    return NextResponse.json({ id: deleted.id, estado: deleted.estado })
  } catch (error) {
    return errorResponse("DELETE_FAILED", 500)
  }
}
