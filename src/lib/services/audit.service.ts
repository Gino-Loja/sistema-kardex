import { randomUUID } from "crypto";
import { db } from "@/lib/drizzle/db";
import { auditLog, type AuditAction, type AuditEntity } from "@/lib/drizzle/schema";

interface AuditLogParams {
  entidad: AuditEntity;
  entidadId?: string;
  accion: AuditAction;
  descripcion: string;
  usuarioId?: string | null;
  usuarioNombre: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Registra un evento en la bitácora de auditoría
 */
export async function registrarAuditoria(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      entidad: params.entidad,
      entidadId: params.entidadId,
      accion: params.accion,
      descripcion: params.descripcion,
      usuarioId: params.usuarioId,
      usuarioNombre: params.usuarioNombre,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    // Log error but don't throw - audit should not break main operations
    console.error("Error registrando auditoría:", error);
  }
}

// Helpers para acciones comunes
export const audit = {
  crear: (entidad: AuditEntity, entidadId: string, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, entidadId, accion: "crear", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  editar: (entidad: AuditEntity, entidadId: string, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, entidadId, accion: "editar", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  eliminar: (entidad: AuditEntity, entidadId: string, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, entidadId, accion: "eliminar", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  publicar: (entidad: AuditEntity, entidadId: string, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, entidadId, accion: "publicar", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  anular: (entidad: AuditEntity, entidadId: string, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, entidadId, accion: "anular", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  importar: (entidad: AuditEntity, descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad, accion: "importar", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),

  configurar: (descripcion: string, usuario: { id?: string; nombre: string }, metadata?: Record<string, unknown>) =>
    registrarAuditoria({ entidad: "configuracion", accion: "configurar", descripcion, usuarioId: usuario.id, usuarioNombre: usuario.nombre, metadata }),
};
