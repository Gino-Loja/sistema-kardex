import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { detalleMovimientos, movimientos } from "@/lib/drizzle/schema";
import type { MovimientoConDetalles } from "@/lib/dal/repositories/movimientos.repository";

export const listMovements = async ({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const offset = (page - 1) * pageSize;

  const items = await db
    .select()
    .from(movimientos)
    .orderBy(desc(movimientos.fecha))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(movimientos);

  return {
    items,
    total: Number(count),
  };
};

export const getMovimientoById = async (
  id: string,
): Promise<MovimientoConDetalles | null> => {
  const [movimiento] = await db
    .select()
    .from(movimientos)
    .where(eq(movimientos.id, id))
    .limit(1);

  if (!movimiento) {
    return null;
  }

  const detalles = await db
    .select()
    .from(detalleMovimientos)
    .where(eq(detalleMovimientos.movimientoId, movimiento.id));

  return {
    ...movimiento,
    detalles,
  };
};
