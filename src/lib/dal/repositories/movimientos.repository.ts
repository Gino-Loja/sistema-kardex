import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { detalleMovimientos, movimientos } from "@/lib/drizzle/schema";

export type Movimiento = InferSelectModel<typeof movimientos>;
export type DetalleMovimiento = InferSelectModel<typeof detalleMovimientos>;

export type MovimientoConDetalles = Movimiento & {
  detalles: DetalleMovimiento[];
};

export type MovimientoCreate = Omit<
  InferInsertModel<typeof movimientos>,
  "id"
> & {
  id?: string;
  detalles: Array<Omit<InferInsertModel<typeof detalleMovimientos>, "id" | "movimientoId"> & {
    id?: string;
  }>;
};

export const movimientosRepository = {
  async obtenerPorId(id: string): Promise<MovimientoConDetalles | null> {
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

    return { ...movimiento, detalles };
  },

  async crear(input: MovimientoCreate): Promise<MovimientoConDetalles> {
    const movimientoId = input.id ?? randomUUID();
    const { detalles, ...data } = input;

    const detallesParaInsertar = detalles.map((detalle) => ({
      id: detalle.id ?? randomUUID(),
      movimientoId,
      itemId: detalle.itemId,
      cantidad: detalle.cantidad,
      costoUnitario: detalle.costoUnitario,
      costoTotal: detalle.costoTotal,
    }));

    const [movimiento] = await db.transaction(async (tx) => {
      const [nuevoMovimiento] = await tx
        .insert(movimientos)
        .values({
          ...data,
          id: movimientoId,
        })
        .returning();

      if (detallesParaInsertar.length > 0) {
        await tx.insert(detalleMovimientos).values(detallesParaInsertar);
      }

      return [nuevoMovimiento];
    });

    const detallesGuardados = await db
      .select()
      .from(detalleMovimientos)
      .where(eq(detalleMovimientos.movimientoId, movimientoId));

    return {
      ...movimiento,
      detalles: detallesGuardados,
    };
  },

  async actualizar(
    id: string,
    input: Partial<Omit<MovimientoCreate, "detalles">> & {
      detalles?: MovimientoCreate["detalles"];
    },
  ): Promise<MovimientoConDetalles> {
    const { detalles, ...data } = input;
    await db.transaction(async (tx) => {
      await tx
        .update(movimientos)
        .set({
          ...data,
          actualizadoEn: new Date(),
        })
        .where(eq(movimientos.id, id));

      if (detalles) {
        await tx
          .delete(detalleMovimientos)
          .where(eq(detalleMovimientos.movimientoId, id));

        if (detalles.length > 0) {
          const detallesParaInsertar = detalles.map((detalle) => ({
            id: detalle.id ?? randomUUID(),
            movimientoId: id,
            itemId: detalle.itemId,
            cantidad: detalle.cantidad,
            costoUnitario: detalle.costoUnitario,
            costoTotal: detalle.costoTotal,
          }));

          await tx.insert(detalleMovimientos).values(detallesParaInsertar);
        }
      }
    });

    const movimiento = await this.obtenerPorId(id);

    if (!movimiento) {
      throw new Error("NOT_FOUND");
    }

    return movimiento;
  },

  async actualizarEstado(
    id: string,
    estado: Movimiento["estado"],
  ): Promise<Movimiento> {
    const [actualizado] = await db
      .update(movimientos)
      .set({ estado, actualizadoEn: new Date() })
      .where(eq(movimientos.id, id))
      .returning();

    if (!actualizado) {
      throw new Error("NOT_FOUND");
    }

    return actualizado;
  },

  /**
   * Actualiza el snapshot del estado resultante en un detalle de movimiento específico.
   * Se usa al publicar el movimiento para guardar el historial del Kardex.
   * @param tipo - 'destino' para entradas, 'origen' para salidas
   */
  async actualizarSnapshotDetalle(
    movimientoId: string,
    itemId: string,
    snapshot: {
      stockResultante: number;
      costoPromedioResultante: number;
      valorTotalResultante: number;
    },
    tipo: 'destino' | 'origen' = 'destino',
  ): Promise<void> {
    const detalles = await db
      .select()
      .from(detalleMovimientos)
      .where(eq(detalleMovimientos.movimientoId, movimientoId));

    const detalleItem = detalles.find((d) => d.itemId === itemId);
    if (detalleItem) {
      const updateData = tipo === 'destino'
        ? {
            stockResultante: snapshot.stockResultante,
            costoPromedioResultante: snapshot.costoPromedioResultante,
            valorTotalResultante: snapshot.valorTotalResultante,
          }
        : {
            stockResultanteOrigen: snapshot.stockResultante,
            costoPromedioResultanteOrigen: snapshot.costoPromedioResultante,
            valorTotalResultanteOrigen: snapshot.valorTotalResultante,
          };

      await db
        .update(detalleMovimientos)
        .set(updateData)
        .where(eq(detalleMovimientos.id, detalleItem.id));
    }
  },
};
