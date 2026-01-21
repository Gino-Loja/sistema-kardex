import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { bodegas, items, terceros } from "@/lib/drizzle/schema";

export const listItems = async ({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const offset = (page - 1) * pageSize;

  const itemsList = await db
    .select()
    .from(items)
    .orderBy(asc(items.codigo))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(items);

  return {
    items: itemsList,
    total: Number(count),
  };
};

export const getItemById = async (id: string) => {
  const [item] = await db
    .select()
    .from(items)
    .where(eq(items.id, id))
    .limit(1);

  return item ?? null;
};

export const listBodegas = async ({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const offset = (page - 1) * pageSize;

  const bodegasList = await db
    .select()
    .from(bodegas)
    .orderBy(asc(bodegas.identificacion))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bodegas);

  return {
    items: bodegasList,
    total: Number(count),
  };
};

export const getBodegaById = async (id: string) => {
  const [bodega] = await db
    .select()
    .from(bodegas)
    .where(eq(bodegas.id, id))
    .limit(1);

  return bodega ?? null;
};

export const listTerceros = async ({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const offset = (page - 1) * pageSize;

  const tercerosList = await db
    .select()
    .from(terceros)
    .orderBy(asc(terceros.nombre))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(terceros);

  return {
    items: tercerosList,
    total: Number(count),
  };
};

export const getTerceroById = async (id: string) => {
  const [tercero] = await db
    .select()
    .from(terceros)
    .where(eq(terceros.id, id))
    .limit(1);

  return tercero ?? null;
};
