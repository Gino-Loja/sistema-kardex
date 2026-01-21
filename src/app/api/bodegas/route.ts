import { NextResponse } from "next/server"

import { listBodegas, createBodega } from "@/lib/data/bodegas"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission, requireRole } from "@/lib/auth/guards"
import { bodegaCreateSchema, bodegaListQuerySchema } from "@/lib/validators/bodega"

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
  const parsed = bodegaListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return errorResponse("PARAMS_INVALID")
  }

  const result = await listBodegas(parsed.data)

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const authError = await requireMastersPermission("masters:write", { adminOnly: true })
  if (authError) {
    return authError
  }

  const body = await request.json().catch(() => null)
  const parsed = bodegaCreateSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  try {
    const created = await createBodega(parsed.data)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED"
    if (message.includes("bodegas_identificacion_idx") || message.includes("duplicate")) {
      return errorResponse("IDENTIFICATION_EXISTS", 409)
    }
    return errorResponse("CREATE_FAILED", 500)
  }
}
