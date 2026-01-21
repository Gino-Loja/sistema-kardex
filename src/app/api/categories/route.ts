import { NextResponse } from "next/server"

import { listCategorias, createCategoria } from "@/lib/data/categorias"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { categoriaCreateSchema } from "@/lib/validators/categoria"
import { paginationSchema } from "@/lib/validations/common"

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

export async function GET(request: Request) {
  const authError = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { searchParams } = new URL(request.url)
  const parsed = paginationSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return errorResponse("PARAMS_INVALID")
  }

  const result = await listCategorias(parsed.data)

  return NextResponse.json(result.items)
}

export async function POST(request: Request) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const body = await request.json().catch(() => null)
  const parsed = categoriaCreateSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  try {
    const created = await createCategoria(parsed.data)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED"
    if (message.includes("categorias_nombre_idx") || message.includes("duplicate")) {
      return errorResponse("NAME_EXISTS", 409)
    }
    return errorResponse("CREATE_FAILED", 500)
  }
}
