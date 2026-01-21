import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { categorias, items } from "@/lib/drizzle/schema";

export type Categoria = InferSelectModel<typeof categorias>;
export type CategoriaCreate = Omit<
  InferInsertModel<typeof categorias>,
  "id" | "creadoEn" | "actualizadoEn"
> & {
  id?: string;
};

export const categoriasRepository = {
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
      .from(categorias)
      .orderBy(categorias.nombre)
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categorias);

    return {
      items: itemsList,
      total: Number(count),
    };
  },

  async obtenerPorId(id: string): Promise<Categoria | null> {
    const [categoria] = await db
      .select()
      .from(categorias)
      .where(eq(categorias.id, id))
      .limit(1);

    return categoria ?? null;
  },

  async crear(input: CategoriaCreate): Promise<Categoria> {
    const id = input.id ?? randomUUID();

    const [creado] = await db
      .insert(categorias)
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

  async actualizar(id: string, input: Partial<CategoriaCreate>): Promise<Categoria> {
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as Partial<CategoriaCreate>;

    const [actualizado] = await db
      .update(categorias)
      .set({
        ...data,
        actualizadoEn: new Date(),
      })
      .where(eq(categorias.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async eliminar(id: string): Promise<Categoria> {
    return db.transaction(async (tx) => {
      await tx
        .update(items)
        .set({ categoriaId: null })
        .where(eq(items.categoriaId, id));

      const [eliminado] = await tx
        .delete(categorias)
        .where(eq(categorias.id, id))
        .returning();

      if (!eliminado) {
        throw new Error("NOT_FOUND");
      }

      return eliminado;
    });
  },

  async desactivar(id: string): Promise<Categoria> {
    return this.actualizar(id, { estado: "inactivo" });
  },
};
