import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { bodegas } from "@/lib/drizzle/schema";

export type Bodega = InferSelectModel<typeof bodegas>;
export type BodegaCreate = Omit<
  InferInsertModel<typeof bodegas>,
  "id" | "creadoEn" | "actualizadoEn"
> & {
  id?: string;
};

export const bodegasRepository = {
  async listar({
    page = 1,
    pageSize = 20,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    const offset = (page - 1) * pageSize;

    const items = await db
      .select()
      .from(bodegas)
      .orderBy(bodegas.identificacion)
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bodegas);

    return {
      items,
      total: Number(count),
    };
  },

  async obtenerPorId(id: string): Promise<Bodega | null> {
    const [bodega] = await db
      .select()
      .from(bodegas)
      .where(eq(bodegas.id, id))
      .limit(1);

    return bodega ?? null;
  },

  async crear(input: BodegaCreate): Promise<Bodega> {
    const id = input.id ?? randomUUID();

    const [creado] = await db
      .insert(bodegas)
      .values({
        ...input,
        id,
      })
      .returning();

    if (!creado) {
      throw new Error("NOT_FOUND");
    }

    return creado;
  },

  async actualizar(id: string, input: Partial<BodegaCreate>): Promise<Bodega> {
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<BodegaCreate>;

    const [actualizado] = await db
      .update(bodegas)
      .set({
        ...data,
        actualizadoEn: new Date(),
      })
      .where(eq(bodegas.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async desactivar(id: string): Promise<Bodega> {
    return this.actualizar(id, { estado: "inactivo" });
  },

  async actualizarModoCostoPromedio(
    id: string,
    autoUpdateAverageCost: boolean,
  ): Promise<Bodega> {
    const [actualizado] = await db
      .update(bodegas)
      .set({
        auto_update_average_cost: autoUpdateAverageCost,
        actualizadoEn: new Date(),
      })
      .where(eq(bodegas.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },
};
