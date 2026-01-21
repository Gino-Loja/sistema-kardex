import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { terceros } from "@/lib/drizzle/schema";

export type Tercero = InferSelectModel<typeof terceros>;
export type TerceroCreate = Omit<
  InferInsertModel<typeof terceros>,
  "id" | "creadoEn" | "actualizadoEn"
> & {
  id?: string;
};

export const tercerosRepository = {
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
      .from(terceros)
      .orderBy(terceros.nombre)
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(terceros);

    return {
      items,
      total: Number(count),
    };
  },

  async obtenerPorId(id: string): Promise<Tercero | null> {
    const [tercero] = await db
      .select()
      .from(terceros)
      .where(eq(terceros.id, id))
      .limit(1);

    return tercero ?? null;
  },

  async crear(input: TerceroCreate): Promise<Tercero> {
    const id = input.id ?? randomUUID();

    const [creado] = await db
      .insert(terceros)
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

  async actualizar(id: string, input: Partial<TerceroCreate>): Promise<Tercero> {
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<TerceroCreate>;

    const [actualizado] = await db
      .update(terceros)
      .set({
        ...data,
        actualizadoEn: new Date(),
      })
      .where(eq(terceros.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async desactivar(id: string): Promise<Tercero> {
    return this.actualizar(id, { estado: "inactivo" });
  },
};
