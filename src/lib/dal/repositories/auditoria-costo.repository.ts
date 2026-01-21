import { randomUUID } from "crypto";
import { desc, eq, and } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { auditoriaCostoPromedio } from "@/lib/drizzle/schema";

export type AuditoriaCostoPromedio = InferSelectModel<typeof auditoriaCostoPromedio>;
export type AuditoriaCostoPromedioCreate = Omit<InferInsertModel<typeof auditoriaCostoPromedio>, "id" | "fecha"> & {
  id?: string;
  fecha?: Date;
};

export const auditoriaCostoRepository = {
  async crear(input: AuditoriaCostoPromedioCreate): Promise<AuditoriaCostoPromedio> {
    const id = input.id ?? randomUUID();
    const [creado] = await db
      .insert(auditoriaCostoPromedio)
      .values({
        ...input,
        id,
        fecha: input.fecha ?? new Date(),
      })
      .returning();

    if (!creado) {
      throw new Error("AUDIT_CREATE_FAILED");
    }

    return creado;
  },

  async listarPorItemBodega(
    itemBodegaId: string,
    opciones: { page?: number; pageSize?: number } = {}
  ): Promise<{ data: AuditoriaCostoPromedio[]; total: number }> {
    const { page = 1, pageSize = 20 } = opciones;
    const offset = (page - 1) * pageSize;

    const [registros, countResult] = await Promise.all([
      db
        .select()
        .from(auditoriaCostoPromedio)
        .where(eq(auditoriaCostoPromedio.itemBodegaId, itemBodegaId))
        .orderBy(desc(auditoriaCostoPromedio.fecha))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: auditoriaCostoPromedio.id })
        .from(auditoriaCostoPromedio)
        .where(eq(auditoriaCostoPromedio.itemBodegaId, itemBodegaId)),
    ]);

    return {
      data: registros,
      total: countResult.length,
    };
  },

  async obtenerPorMovimiento(movimientoId: string): Promise<AuditoriaCostoPromedio[]> {
    return db
      .select()
      .from(auditoriaCostoPromedio)
      .where(eq(auditoriaCostoPromedio.movimientoId, movimientoId))
      .orderBy(desc(auditoriaCostoPromedio.fecha));
  },

  async obtenerUltimoPorItemBodega(itemBodegaId: string): Promise<AuditoriaCostoPromedio | null> {
    const [registro] = await db
      .select()
      .from(auditoriaCostoPromedio)
      .where(eq(auditoriaCostoPromedio.itemBodegaId, itemBodegaId))
      .orderBy(desc(auditoriaCostoPromedio.fecha))
      .limit(1);

    return registro ?? null;
  },
};
