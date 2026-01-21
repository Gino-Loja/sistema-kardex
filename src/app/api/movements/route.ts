import { NextResponse } from "next/server"

import { listMovements, createMovement } from "@/lib/data/movements"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { movementCreateSchema, movementListQuerySchema } from "@/lib/validators/movement"

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireMovementsPermission = async (permission: "movements:read" | "movements:write") => {
  try {
    const session = await getAuthSession()
    const user = requirePermission(session, permission)
    return { user, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", 403) }
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", 401) }
  }
}

export async function GET(request: Request) {
  const { error } = await requireMovementsPermission("movements:read")
  if (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const parsed = movementListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
    estado: searchParams.get("estado") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  })

  if (!parsed.success) {
    return errorResponse("PARAMS_INVALID")
  }

  try {
    const result = await listMovements(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "LIST_FAILED"
    return errorResponse(message, 500)
  }
}

export async function POST(request: Request) {
  const { user, error } = await requireMovementsPermission("movements:write")
  if (error || !user) {
    return error ?? errorResponse("UNAUTHENTICATED", 401)
  }

  const body = await request.json().catch(() => null)
  const parsed = movementCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const created = await createMovement(parsed.data, user.id)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED"

    if (message.startsWith("STOCK_INSUFFICIENT")) {
      return NextResponse.json(
        { error: "STOCK_INSUFFICIENT", details: message.replace("STOCK_INSUFFICIENT: ", "") },
        { status: 422 }
      )
    }

    return errorResponse(message, 500)
  }
}
