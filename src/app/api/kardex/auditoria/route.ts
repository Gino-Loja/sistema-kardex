import { NextResponse } from "next/server";

import { getAuditoriaData } from "@/lib/data/kardex";
import { getAuthSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { auditoriaQuerySchema } from "@/lib/validators/kardex";

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
  const parsed = auditoriaQuerySchema.safeParse({
    itemId: searchParams.get("itemId") ?? undefined,
    bodegaId: searchParams.get("bodegaId") ?? undefined,
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
    const result = await getAuditoriaData(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUDITORIA_FETCH_FAILED";
    return errorResponse(message, 500);
  }
}
