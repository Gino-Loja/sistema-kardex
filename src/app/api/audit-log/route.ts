import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { getAuditLogData, type AuditLogQuery } from "@/lib/data/audit-log";
import { z } from "zod";
import type { AuditAction, AuditEntity } from "@/lib/drizzle/schema";

const auditLogQuerySchema = z.object({
  entidad: z.string().optional(),
  accion: z.string().optional(),
  usuarioId: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const requireAuditPermission = async () => {
  try {
    const session = await getAuthSession();
    const user = requirePermission(session, "users:manage");
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
  const { error } = await requireAuditPermission();
  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = auditLogQuerySchema.safeParse({
    entidad: searchParams.get("entidad") ?? undefined,
    accion: searchParams.get("accion") ?? undefined,
    usuarioId: searchParams.get("usuarioId") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
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
    const query: AuditLogQuery = {
      entidad: parsed.data.entidad as AuditEntity | undefined,
      accion: parsed.data.accion as AuditAction | undefined,
      usuarioId: parsed.data.usuarioId,
      fechaDesde: parsed.data.fechaDesde ? new Date(parsed.data.fechaDesde) : undefined,
      fechaHasta: parsed.data.fechaHasta ? new Date(parsed.data.fechaHasta) : undefined,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    };

    const result = await getAuditLogData(query);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUDIT_LOG_FETCH_FAILED";
    return errorResponse(message, 500);
  }
}
