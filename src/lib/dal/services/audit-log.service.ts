import type {
  AuditLogCreate,
  AuditLogEntry,
  AuditLogRepository,
} from "../repositories";

export type AuditLogService = {
  registrarEvento: (input: AuditLogCreate) => Promise<AuditLogEntry>;
};

export const createAuditLogService = (
  repository: AuditLogRepository,
): AuditLogService => ({
  registrarEvento: async (input) => {
    const fecha = input.fecha ?? new Date();

    return repository.create({
      ...input,
      fecha,
    });
  },
});
