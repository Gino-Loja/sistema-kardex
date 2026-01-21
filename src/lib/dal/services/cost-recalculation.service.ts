
import { db } from "@/lib/drizzle/db";
import { itemBodegas, movimientos, detalleMovimientos } from "@/lib/drizzle/schema";
import { and, eq, inArray, asc, or, sql } from "drizzle-orm";
import { calcularCostoPromedioPonderado, aplicarSalidaInventario, type EstadoInventario } from "@/lib/dal/services/inventory-valuation.service";

export const costRecalculationService = {
  async recalculateCosts(options: { bodegaId?: string | null }) {
    const { bodegaId } = options;

    const query = db.select().from(itemBodegas);
    if (bodegaId) {
      query.where(eq(itemBodegas.bodegaId, bodegaId));
    }

    const allItemBodegas = await query;

    const itemBodegasByBodega = allItemBodegas.reduce((acc, ib) => {
      if (!acc[ib.bodegaId]) {
        acc[ib.bodegaId] = [];
      }
      acc[ib.bodegaId].push(ib);
      return acc;
    }, {} as Record<string, typeof allItemBodegas>);

    for (const currentBodegaId in itemBodegasByBodega) {
      const bodegaItems = itemBodegasByBodega[currentBodegaId];
      const itemIds = bodegaItems.map((bi) => bi.itemId);

      if (itemIds.length === 0) {
        continue;
      }

      // Get ALL published movements that affect this bodega's inventory:
      // - Entries (entrada) to this bodega (any subtype, including null for initial assignments)
      // - Exits (salida) from this bodega
      // - Transfers where this bodega is origin or destination
      const bodegaMovements = await db
        .select({
          movimiento: movimientos,
          detalle: detalleMovimientos,
        })
        .from(movimientos)
        .innerJoin(detalleMovimientos, eq(movimientos.id, detalleMovimientos.movimientoId))
        .where(
          and(
            eq(movimientos.estado, "publicado"),
            inArray(detalleMovimientos.itemId, itemIds),
            or(
              // Entries to this bodega
              and(
                eq(movimientos.tipo, "entrada"),
                eq(movimientos.bodegaDestinoId, currentBodegaId)
              ),
              // Exits from this bodega
              and(
                eq(movimientos.tipo, "salida"),
                eq(movimientos.bodegaOrigenId, currentBodegaId)
              ),
              // Transfers involving this bodega (as origin or destination)
              and(
                eq(movimientos.tipo, "transferencia"),
                or(
                  eq(movimientos.bodegaOrigenId, currentBodegaId),
                  eq(movimientos.bodegaDestinoId, currentBodegaId)
                )
              )
            )
          )
        )
        .orderBy(asc(movimientos.fecha), asc(movimientos.creadoEn));

      for (const item of bodegaItems) {
        let estadoInventario: EstadoInventario = { stockActual: 0, costoPromedio: 0 };

        const itemMovements = bodegaMovements.filter(
          (m) => m.detalle.itemId === item.itemId
        );

        for (const movement of itemMovements) {
          const mov = movement.movimiento;
          const det = movement.detalle;
          const cantidad = det.cantidad;
          const costoUnitario = det.costoUnitario || 0;

          // Determine if this movement is an entry or exit for this bodega
          const esEntrada =
            mov.tipo === "entrada" ||
            (mov.tipo === "transferencia" && mov.bodegaDestinoId === currentBodegaId);

          const esSalida =
            mov.tipo === "salida" ||
            (mov.tipo === "transferencia" && mov.bodegaOrigenId === currentBodegaId);

          if (esEntrada) {
            // For entries, use the cost from the movement detail
            // This applies the weighted average formula correctly
            estadoInventario = calcularCostoPromedioPonderado(estadoInventario, {
              cantidad,
              costoUnitario,
            });
          } else if (esSalida) {
            // For exits, reduce stock but keep the average cost
            const resultado = aplicarSalidaInventario(estadoInventario, {
              cantidad,
              permitirNegativo: true, // Allow negative to handle data inconsistencies
            });
            estadoInventario = {
              stockActual: resultado.stockActual,
              costoPromedio: resultado.costoPromedio,
            };
          }
        }

        // Calculate valorTotal from stock and average cost
        const valorTotal = estadoInventario.stockActual * estadoInventario.costoPromedio;

        await db
          .update(itemBodegas)
          .set({
            costoPromedio: estadoInventario.costoPromedio,
            stockActual: estadoInventario.stockActual,
            valorTotal,
            actualizadoEn: new Date(),
          })
          .where(eq(itemBodegas.id, item.id));
      }
    }

    return { success: true, message: "Cost recalculation completed successfully." };
  },
};
