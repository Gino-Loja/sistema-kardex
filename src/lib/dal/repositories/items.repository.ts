import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { items } from "@/lib/drizzle/schema";

export type Item = InferSelectModel<typeof items>;
export type ItemCreate = Omit<
  InferInsertModel<typeof items>,
  "id" | "creadoEn" | "actualizadoEn"
> & {
  id?: string;
};

export const itemsRepository = {
  async listar({
    page = 1,
    pageSize = 20,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    const offset = (page - 1) * pageSize;

    const itemsList = await db
      .select()
      .from(items)
      .orderBy(items.codigo)
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items);

    return {
      items: itemsList,
      total: Number(count),
    };
  },

  async obtenerPorId(id: string): Promise<Item | null> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .limit(1);

    return item ?? null;
  },

  async crear(input: ItemCreate): Promise<Item> {
    const id = input.id ?? randomUUID();

    const [creado] = await db
      .insert(items)
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

  async actualizar(id: string, input: Partial<ItemCreate>): Promise<Item> {
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<ItemCreate>;

    const [actualizado] = await db
      .update(items)
      .set({
        ...data,
        actualizadoEn: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async desactivar(id: string): Promise<Item> {
    return this.actualizar(id, { estado: "inactivo" });
  },

  async actualizarCostoPromedio(
    id: string,
    nuevoCostoPromedio: number
  ): Promise<Item> {
    return this.actualizar(id, { costoPromedio: nuevoCostoPromedio });
  },
};
