import { NextResponse } from "next/server";

import { getKardexData } from "@/lib/data/kardex";
import { getAuthSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { kardexQuerySchema } from "@/lib/validators/kardex";

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const requireKardexPermission = async () => {
  try {
    const session = await getAuthSession();
    const user = requirePermission(session, "movements:read");
    return { user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", 403) };
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", 401) };
  }
};

export async function GET(request: Request) {
  const { error } = await requireKardexPermission();
  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = kardexQuerySchema.safeParse({
    itemId: searchParams.get("itemId") ?? undefined,
    bodegaId: searchParams.get("bodegaId") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await getKardexData(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "KARDEX_FETCH_FAILED";

    if (message === "ITEM_NOT_FOUND") {
      return errorResponse("ITEM_NOT_FOUND", 404);
    }

    return errorResponse(message, 500);
  }
}
