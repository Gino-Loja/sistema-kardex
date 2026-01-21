import { NextResponse } from "next/server"

import { deleteCategoria, getCategoriaById, updateCategoria } from "@/lib/data/categorias"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { categoriaPatchSchema } from "@/lib/validators/categoria"

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const categoria = await getCategoriaById(id)

  if (!categoria) {
    return errorResponse("NOT_FOUND", 404)
  }

  return NextResponse.json(categoria)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getCategoriaById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  const body = await request.json().catch(() => null)
  const parsed = categoriaPatchSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const hasFields = Object.values(parsed.data).some((value) => value !== undefined)
  if (!hasFields) {
    return errorResponse("NO_CHANGES")
  }

  try {
    const updated = await updateCategoria(id, parsed.data)

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED"
    if (message.includes("categorias_nombre_idx") || message.includes("duplicate")) {
      return errorResponse("NAME_EXISTS", 409)
    }
    return errorResponse("UPDATE_FAILED", 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getCategoriaById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  try {
    const deleted = await deleteCategoria(id)

    return NextResponse.json({ id: deleted.id })
  } catch (error) {
    return errorResponse("DELETE_FAILED", 500)
  }
}
