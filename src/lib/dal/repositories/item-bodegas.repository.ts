import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { itemBodegas } from "@/lib/drizzle/schema";

export type ItemBodega = InferSelectModel<typeof itemBodegas>;
export type ItemBodegaCreate = Omit<InferInsertModel<typeof itemBodegas>, "id"> & {
  id?: string;
};
export type ItemBodegaUpdate = Partial<
  Pick<ItemBodega, "stockActual" | "stockMinimo" | "stockMaximo" | "costoPromedio">
>;

export const itemBodegasRepository = {
  async obtenerPorItemBodega(
    itemId: string,
    bodegaId: string,
  ): Promise<ItemBodega | null> {
    const [registro] = await db
      .select()
      .from(itemBodegas)
      .where(and(eq(itemBodegas.itemId, itemId), eq(itemBodegas.bodegaId, bodegaId)))
      .limit(1);

    return registro ?? null;
  },

  async crear(input: ItemBodegaCreate): Promise<ItemBodega> {
    const existente = await this.obtenerPorItemBodega(
      input.itemId,
      input.bodegaId,
    );

    if (existente) {
      throw new Error("DUPLICATE");
    }

    const id = input.id && input.id.trim().length > 0
      ? input.id
      : randomUUID();
    const [creado] = await db
      .insert(itemBodegas)
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

  async guardar(input: ItemBodegaCreate): Promise<ItemBodega> {
    const existente = await this.obtenerPorItemBodega(
      input.itemId,
      input.bodegaId,
    );

    if (!existente) {
      const id = input.id && input.id.trim().length > 0
        ? input.id
        : randomUUID();
      const [creado] = await db
        .insert(itemBodegas)
        .values({
          ...input,
          id,
        })
        .returning();

      if (!creado) {
        throw new Error("NOT_FOUND");
      }

      return creado;
    }

    const [actualizado] = await db
      .update(itemBodegas)
      .set({
        stockActual: input.stockActual ?? existente.stockActual,
        stockMinimo: input.stockMinimo ?? existente.stockMinimo,
        stockMaximo: input.stockMaximo ?? existente.stockMaximo,
        costoPromedio: input.costoPromedio ?? existente.costoPromedio,
      })
      .where(eq(itemBodegas.id, existente.id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async actualizar(
    itemId: string,
    bodegaId: string,
    cambios: ItemBodegaUpdate,
  ): Promise<ItemBodega> {
    const existente = await this.obtenerPorItemBodega(itemId, bodegaId);

    if (!existente) {
      throw new Error("NOT_FOUND");
    }

    const [actualizado] = await db
      .update(itemBodegas)
      .set({
        stockActual: cambios.stockActual ?? existente.stockActual,
        stockMinimo: cambios.stockMinimo ?? existente.stockMinimo,
        stockMaximo: cambios.stockMaximo ?? existente.stockMaximo,
        costoPromedio: cambios.costoPromedio ?? existente.costoPromedio,
      })
      .where(eq(itemBodegas.id, existente.id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  async eliminar(itemId: string, bodegaId: string): Promise<void> {
    const [eliminado] = await db
      .delete(itemBodegas)
      .where(and(eq(itemBodegas.itemId, itemId), eq(itemBodegas.bodegaId, bodegaId)))
      .returning();

    if (!eliminado) {
      throw new Error("NOT_FOUND");
    }
  },

  /**
   * Actualiza el costo promedio y stock de un item en una bodega.
   * Retorna el estado anterior y el nuevo estado para auditoría.
   */
  async actualizarCostoPromedio(
    itemId: string,
    bodegaId: string,
    nuevoCostoPromedio: number,
    nuevaCantidad: number,
  ): Promise<{ anterior: ItemBodega; actualizado: ItemBodega }> {
    const existente = await this.obtenerPorItemBodega(itemId, bodegaId);

    if (!existente) {
      throw new Error("NOT_FOUND");
    }

    const [actualizado] = await db
      .update(itemBodegas)
      .set({
        stockActual: nuevaCantidad,
        costoPromedio: nuevoCostoPromedio,
      })
      .where(eq(itemBodegas.id, existente.id))
      .returning();

    if (!actualizado) {
      throw new Error("UPDATE_FAILED");
    }

    return {
      anterior: existente,
      actualizado,
    };
  },

  /**
   * Obtiene el registro de item-bodega por su ID.
   */
  async obtenerPorId(id: string): Promise<ItemBodega | null> {
    const [registro] = await db
      .select()
      .from(itemBodegas)
      .where(eq(itemBodegas.id, id))
      .limit(1);

    return registro ?? null;
  },

  async actualizarCostoPromedioParaItem(
    itemId: string,
    nuevoCostoPromedio: number
  ): Promise<void> {
    await db
      .update(itemBodegas)
      .set({ costoPromedio: nuevoCostoPromedio })
      .where(eq(itemBodegas.itemId, itemId));
  },
};
