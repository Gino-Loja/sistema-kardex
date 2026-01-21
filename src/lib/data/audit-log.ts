import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { auditLog, type AuditAction, type AuditEntity } from "@/lib/drizzle/schema";

export interface AuditLogQuery {
  entidad?: AuditEntity;
  accion?: AuditAction;
  usuarioId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  pageSize?: number;
}

export interface AuditLogRow {
  id: string;
  entidad: AuditEntity;
  entidadId: string | null;
  accion: AuditAction;
  descripcion: string;
  usuarioId: string | null;
  usuarioNombre: string;
  metadata: Record<string, unknown> | null;
  creadoEn: Date;
}

export interface AuditLogResponse {
  data: AuditLogRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const getAuditLogData = async (query: AuditLogQuery): Promise<AuditLogResponse> => {
  const { entidad, accion, usuarioId, fechaDesde, fechaHasta, page = 1, pageSize = 20 } = query;

  const conditions = [];

  if (entidad) {
    conditions.push(eq(auditLog.entidad, entidad));
  }

  if (accion) {
    conditions.push(eq(auditLog.accion, accion));
  }

  if (usuarioId) {
    conditions.push(eq(auditLog.usuarioId, usuarioId));
  }

  if (fechaDesde) {
    conditions.push(gte(auditLog.creadoEn, fechaDesde));
  }

  if (fechaHasta) {
    conditions.push(lte(auditLog.creadoEn, fechaHasta));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLog)
    .where(whereClause);

  const total = Number(count);
  const totalPages = Math.ceil(total / pageSize);

  // Get data
  const data = await db
    .select({
      id: auditLog.id,
      entidad: auditLog.entidad,
      entidadId: auditLog.entidadId,
      accion: auditLog.accion,
      descripcion: auditLog.descripcion,
      usuarioId: auditLog.usuarioId,
      usuarioNombre: auditLog.usuarioNombre,
      metadata: auditLog.metadata,
      creadoEn: auditLog.creadoEn,
    })
    .from(auditLog)
    .where(whereClause)
    .orderBy(desc(auditLog.creadoEn))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    data,
    pagination: { page, pageSize, total, totalPages },
  };
};
