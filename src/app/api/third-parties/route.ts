import { NextResponse } from "next/server"

import { listTerceros, createTercero } from "@/lib/data/terceros"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission, requireRole } from "@/lib/auth/guards"
import { terceroCreateSchema, terceroListQuerySchema } from "@/lib/validators/tercero"

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

export async function GET(request: Request) {
  const authError = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { searchParams } = new URL(request.url)
  const parsed = terceroListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    estado: searchParams.get("estado") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
  })

  if (!parsed.success) {
    return errorResponse("PARAMS_INVALID")
  }

  const result = await listTerceros(parsed.data)

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const authError = await requireMastersPermission("masters:write", { adminOnly: true })
  if (authError) {
    return authError
  }

  const body = await request.json().catch(() => null)
  const parsed = terceroCreateSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  try {
    const created = await createTercero(parsed.data)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED"
    if (message.includes("terceros_tipo_identificacion_idx") || message.includes("duplicate")) {
      return errorResponse("IDENTIFICATION_EXISTS", 409)
    }
    return errorResponse("CREATE_FAILED", 500)
  }
}
