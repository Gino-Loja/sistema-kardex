import { randomUUID } from "crypto";
import { db } from "@/lib/drizzle/db"
import { itemBodegas } from "@/lib/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { MovementDetailInput } from "@/lib/validators/movement"
import type { MovementSubType, MovementType } from "@/lib/types/kardex";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { ExtractTablesWithRelations } from "drizzle-orm";

export class WeightedAverageService {
  async updateStockAndAverageCost(
    bodegaId: string,
    movementType: MovementType,
    details: MovementDetailInput[],
    tx: PgTransaction<NodePgQueryResultHKT, typeof import("@/lib/drizzle/schema"), ExtractTablesWithRelations<typeof import("@/lib/drizzle/schema")>>
  ) {
    for (const detail of details) {
      const { itemId, cantidad, costoUnitario } = detail

      const [currentItemBodega] = await tx
        .select()
        .from(itemBodegas)
        .where(
          and(
            eq(itemBodegas.bodegaId, bodegaId),
            eq(itemBodegas.itemId, itemId)
          )
        )
        .limit(1)

      if (movementType === "entrada") {
        if (currentItemBodega) {
          const stockAnterior = currentItemBodega.stockActual
          const costoPromedioAnterior = currentItemBodega.costoPromedio
          const newStock = stockAnterior + cantidad

          // Use the correct weighted average formula:
          // newAvgCost = (oldStock * oldAvgCost + newQty * newUnitCost) / newStock
          const valorAnterior = stockAnterior * costoPromedioAnterior
          const valorEntrada = cantidad * (costoUnitario ?? 0)
          const newAverageCost = newStock > 0 ? (valorAnterior + valorEntrada) / newStock : 0
          const newTotalValue = newStock * newAverageCost

          await tx
            .update(itemBodegas)
            .set({
              stockActual: newStock,
              costoPromedio: newAverageCost,
              valorTotal: newTotalValue,
              actualizadoEn: new Date(),
            })
            .where(
              and(
                eq(itemBodegas.bodegaId, bodegaId),
                eq(itemBodegas.itemId, itemId)
              )
            )
        } else {
          // First time item is added to this bodega
          const newTotalValue = cantidad * (costoUnitario ?? 0)
          await tx.insert(itemBodegas).values({
            id: randomUUID(),
            bodegaId,
            itemId,
            stockActual: cantidad,
            costoPromedio: costoUnitario ?? 0,
            valorTotal: newTotalValue,
            stockMinimo: 0,
            stockMaximo: 0,
            creadoEn: new Date(),
            actualizadoEn: new Date(),
          })
        }
      } else {
        // Salida or Transferencia
        if (currentItemBodega) {
          const newStock = currentItemBodega.stockActual - cantidad
          const newTotalValue = newStock * currentItemBodega.costoPromedio
          
          await tx
            .update(itemBodegas)
            .set({
              stockActual: newStock,
              valorTotal: newTotalValue,
              actualizadoEn: new Date(),
            })
            .where(
              and(
                eq(itemBodegas.bodegaId, bodegaId),
                eq(itemBodegas.itemId, itemId)
              )
            )
        } else {
            // This should not happen if stock validation is correct
            throw new Error(`Item ${itemId} not found in bodega ${bodegaId} for a ${movementType} movement`);
        }
      }
    }
  }
}

export const weightedAverageService = new WeightedAverageService()

/**
 * Determines if the average cost should be recalculated for a given movement.
 * Recalculation is done for purchase entries.
 * @param tipo - The type of movement ('entrada' or 'salida').
 * @param subTipo - The subtype of the movement.
 * @param force - Always returns true if this is set.
 * @returns True if the average cost should be recalculated.
 */
export const debeRecalcularPromedio = (
  tipo: MovementType,
  subTipo: MovementSubType | null,
  force = false,
): boolean => {
  if (force) return true;
  return tipo === "entrada" && subTipo === "compra";
};

/**
 * Determines the cost to apply for an item in a movement.
 * For purchase entries, it's the purchase cost.
 * For other entries, it's the current average cost.
 * @param subTipo - The subtype of the movement.
 * @param costoUnitario - The unit cost of the purchase.
 * @param costoPromedioActual - The current average cost.
 * @returns The cost to apply.
 */
export const obtenerCostoAplicar = (
  subTipo: MovementSubType | null,
  costoUnitario: number | null | undefined,
  costoPromedioActual: number,
): number => {
  if (subTipo === "compra") {
    return costoUnitario ?? 0;
  }
  return costoPromedioActual;
};

/**
 * Validates if there is sufficient stock for a movement.
 * @param stockActual - The current stock.
 * @param cantidadRequerida - The required quantity.
 * @throws An error if the stock is insufficient.
 */
export const validarStockSuficiente = (
  stockActual: number,
  cantidadRequerida: number,
): void => {
  if (stockActual < cantidadRequerida) {
    throw new Error("STOCK_INSUFFICIENT");
  }
};