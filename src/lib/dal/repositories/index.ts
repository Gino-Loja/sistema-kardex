export type Id = string;

export type Pagination = {
  page: number;
  pageSize: number;
};

export type ListResult<T> = {
  items: T[];
  total: number;
};

export type AuditLogEntry = {
  id: Id;
  entidad: string;
  entidadId: Id;
  accion: string;
  usuarioId: Id;
  fecha: Date;
  metadata?: Record<string, unknown> | null;
};

export type AuditLogCreate = Omit<AuditLogEntry, "id"> & {
  id?: Id;
};

export interface AuditLogRepository {
  create(input: AuditLogCreate): Promise<AuditLogEntry>;
  listByEntidad?(entidad: string, entidadId: Id): Promise<AuditLogEntry[]>;
}
