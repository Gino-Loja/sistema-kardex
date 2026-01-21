import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { listItems, createItem } from "@/lib/data/items"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { itemCreateSchema, itemListQuerySchema } from "@/lib/validators/item"
import { deleteItemImageByUrl, uploadItemImage } from "@/lib/services/item-image"

const getTextField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const getOptionalIdField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const getFileField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (value instanceof File && value.size > 0) {
    return value
  }

  return null
}

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

  const parsed = itemListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  })

  if (!parsed.success) {
    return errorResponse("PARAMS_INVALID")
  }

  const result = await listItems(parsed.data)

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const formData = await request.formData()

  const payload = {
    codigo: getTextField(formData, "codigo"),
    nombre: getTextField(formData, "nombre"),
    descripcion: getTextField(formData, "descripcion"),
    unidadMedida: getTextField(formData, "unidadMedida"),
    categoriaId: getOptionalIdField(formData, "categoriaId"),
    estado: getTextField(formData, "estado"),
  }

  const parsed = itemCreateSchema.safeParse(payload)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const image = getFileField(formData, "image")
  const id = randomUUID()

  let imageUrl: string | undefined

  try {
    if (image) {
      const uploaded = await uploadItemImage({ itemId: id, file: image })
      imageUrl = uploaded.url
    }

    const created = await createItem({
      ...parsed.data,
      id,
      imagenUrl: imageUrl,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (imageUrl) {
      await deleteItemImageByUrl(imageUrl)
    }

    const message = error instanceof Error ? error.message : "CREATE_FAILED"

    if (message === "ITEM_IMAGE_TOO_LARGE" || message === "ITEM_IMAGE_TYPE_INVALID") {
      return errorResponse(message)
    }

    return errorResponse("CREATE_FAILED", 500)
  }
}
