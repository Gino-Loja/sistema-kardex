import { db } from "@/lib/drizzle/db";
import { weightedAverageService } from "./weighted-average.service";
import type { AuditLogService } from "./audit-log.service";
import { and, eq } from "drizzle-orm";
import { itemBodegas } from "@/lib/drizzle/schema";

import type { MovementSubType } from "@/lib/types/kardex";
import type { AuditoriaCostoPromedio } from "@/lib/dal/repositories/auditoria-costo.repository";


type MovimientoDetalle = {
  itemId: string;
  cantidad: number;
  costoUnitario?: number | null;
};

type MovimientoBase = {
  id: string;
  tipo: string;
  subTipo?: string | null;
  estado: string;
  fecha: Date;
  bodegaOrigenId?: string | null;
  bodegaDestinoId?: string | null;
  usuarioId: string;
};

type MovimientoConDetalles = MovimientoBase & {
  detalles: MovimientoDetalle[];
};

type AuditoriaCostoInput = {
  itemBodegaId: string;
  movimientoId: string;
  usuarioId: string;
  costoAnterior: number;
  costoNuevo: number;
  cantidadAnterior: number;
  cantidadNueva: number;
};

export type AuditoriaCostoRepository = {
  crear: (input: Omit<AuditoriaCostoPromedio, "id" | "fecha"> & {
    id?: string;
    fecha?: Date;
  }) => Promise<AuditoriaCostoPromedio>;
};

export type MovimientosRepository = {
  obtenerPorId: (id: string) => Promise<MovimientoConDetalles | null>;
  actualizarEstado: (id: string, estado: string) => Promise<{
    id: string;
    tipo: string;
    subTipo: string | null;
    estado: string;
    fecha: Date;
    bodegaOrigenId: string | null;
    bodegaDestinoId: string | null;
    terceroId: string | null;
    usuarioId: string;
    observacion: string | null;
    creadoEn: Date;
    actualizadoEn: Date;
    version: string;
  }>;
  actualizarSnapshotDetalle: (
    movimientoId: string,
    itemId: string,
    snapshot: {
      stockResultante: number;
      costoPromedioResultante: number;
      valorTotalResultante: number;
    },
    tipo?: 'destino' | 'origen',
  ) => Promise<void>;
};

export type ItemBodegaRepository = {
  obtenerPorItemBodega: (
    itemId: string,
    bodegaId: string,
  ) => Promise<import("../repositories/item-bodegas.repository").ItemBodega | null>;
  guardar: (input: import("../repositories/item-bodegas.repository").ItemBodega) => Promise<import("../repositories/item-bodegas.repository").ItemBodega>;
  actualizarCostoPromedioParaItem: (
    itemId: string,
    nuevoCostoPromedio: number
  ) => Promise<void>;
};

export type ItemsRepository = {
  actualizarCostoPromedio: (
    id: string,
    nuevoCostoPromedio: number
  ) => Promise<unknown>;
};

export type BodegasRepository = {
  obtenerPorId: (
    id: string,
  ) => Promise<{ auto_update_average_cost: boolean } | null>;
};

export type CreateMovementsServiceDeps = {
  movimientosRepository: MovimientosRepository;
  itemBodegaRepository: ItemBodegaRepository;
  itemsRepository: ItemsRepository;
  auditLogService: AuditLogService;
  auditoriaCostoRepository?: AuditoriaCostoRepository;
  bodegasRepository: BodegasRepository;
};

export const createMovementsService = ({
  movimientosRepository,
  itemBodegaRepository,
  itemsRepository,
  auditLogService,
  auditoriaCostoRepository,
  bodegasRepository,
}: CreateMovementsServiceDeps) => {
  /**
   * Helper to log cost audit when average changes
   */
  const registrarAuditoriaCosto = async (
    itemBodega: import("../repositories/item-bodegas.repository").ItemBodega,
    movimientoId: string,
    usuarioId: string,
    cantidadAnterior: number,
    cantidadNueva: number,
    costoAnterior: number,
    costoNuevo: number,
  ) => {
    if (!auditoriaCostoRepository) return;
    if (costoAnterior === costoNuevo) return; // No cambió el costo

    await auditoriaCostoRepository.crear({
      itemBodegaId: itemBodega.id,
      movimientoId,
      usuarioId,
      costoAnterior,
      costoNuevo,
      cantidadAnterior,
      cantidadNueva,
    });
  };

  const publicarMovimiento = async ({
    movimientoId,
    usuarioId,
    permitirNegativo,
  }: {
    movimientoId: string;
    usuarioId: string;
    permitirNegativo?: boolean;
  }) => {
    const movimiento = await movimientosRepository.obtenerPorId(movimientoId);

    if (!movimiento) {
      throw new Error("NOT_FOUND");
    }

    if (movimiento.estado !== "borrador") {
      throw new Error("CONFLICT");
    }

    return await db.transaction(async (tx) => {
      const subTipo = (movimiento.subTipo as MovementSubType) ?? null;

      if (movimiento.tipo === "entrada") {
        if (!movimiento.bodegaDestinoId) {
          throw new Error("CONFLICT");
        }

        try {
          for (const detalle of movimiento.detalles) {
            const [existente] = await tx
              .select()
              .from(itemBodegas)
              .where(
                and(
                  eq(itemBodegas.itemId, detalle.itemId),
                  eq(itemBodegas.bodegaId, movimiento.bodegaDestinoId!)
                )
              )
              .limit(1);

            const cantidadAnterior = existente?.stockActual ?? 0;
            const costoAnterior = existente?.costoPromedio ?? 0;

            await weightedAverageService.updateStockAndAverageCost(
              movimiento.bodegaDestinoId!,
              "entrada",
              [{ itemId: detalle.itemId, cantidad: detalle.cantidad, costoUnitario: detalle.costoUnitario }],
              tx
            );

            const [updatedItemBodega] = await tx
              .select()
              .from(itemBodegas)
              .where(
                and(
                  eq(itemBodegas.itemId, detalle.itemId),
                  eq(itemBodegas.bodegaId, movimiento.bodegaDestinoId!)
                )
              )
              .limit(1);


            if (updatedItemBodega && updatedItemBodega.costoPromedio !== costoAnterior) {
              await registrarAuditoriaCosto(
                updatedItemBodega,
                movimientoId,
                usuarioId,
                cantidadAnterior,
                updatedItemBodega.stockActual,
                costoAnterior,
                updatedItemBodega.costoPromedio,
              );
            }

            // Guardar snapshot del estado resultante para el historial Kardex
            if (updatedItemBodega) {
              await movimientosRepository.actualizarSnapshotDetalle(
                movimientoId,
                detalle.itemId,
                {
                  stockResultante: updatedItemBodega.stockActual,
                  costoPromedioResultante: updatedItemBodega.costoPromedio,
                  valorTotalResultante: updatedItemBodega.stockActual * updatedItemBodega.costoPromedio,
                },
              );
            }
          }
        } catch (error) {
          console.error("Failed to process inbound movement details", error);
          throw error;
        }
      }

      if (movimiento.tipo === "salida") {
        if (!movimiento.bodegaOrigenId) {
          throw new Error("CONFLICT");
        }

        for (const detalle of movimiento.detalles) {
          const existente = await itemBodegaRepository.obtenerPorItemBodega(
            detalle.itemId,
            movimiento.bodegaOrigenId!,
          );

          if (!existente) {
            throw new Error("NOT_FOUND");
          }

          await weightedAverageService.updateStockAndAverageCost(
            movimiento.bodegaOrigenId!,
            "salida",
            [{ itemId: detalle.itemId, cantidad: detalle.cantidad }],
            tx
          );

          // Obtener estado actualizado y guardar snapshot para el historial Kardex (origen = salida)
          const updatedItemBodega = await itemBodegaRepository.obtenerPorItemBodega(
            detalle.itemId,
            movimiento.bodegaOrigenId!,
          );

          if (updatedItemBodega) {
            await movimientosRepository.actualizarSnapshotDetalle(
              movimientoId,
              detalle.itemId,
              {
                stockResultante: updatedItemBodega.stockActual,
                costoPromedioResultante: updatedItemBodega.costoPromedio,
                valorTotalResultante: updatedItemBodega.stockActual * updatedItemBodega.costoPromedio,
              },
              'origen',
            );
          }
        }
      }

      if (movimiento.tipo === "transferencia") {
        if (!movimiento.bodegaOrigenId || !movimiento.bodegaDestinoId) {
          throw new Error("CONFLICT");
        }

        if (movimiento.bodegaOrigenId === movimiento.bodegaDestinoId) {
          throw new Error("SAME_BODEGA");
        }

        for (const detalle of movimiento.detalles) {
          const origen = await itemBodegaRepository.obtenerPorItemBodega(
            detalle.itemId,
            movimiento.bodegaOrigenId!,
          );

          if (!origen) {
            throw new Error("NOT_FOUND");
          }

          await weightedAverageService.updateStockAndAverageCost(
            movimiento.bodegaOrigenId!,
            "salida",
            [{ itemId: detalle.itemId, cantidad: detalle.cantidad }],
            tx
          );

          // Guardar snapshot del origen después de la salida
          const updatedOrigenItemBodega = await itemBodegaRepository.obtenerPorItemBodega(
            detalle.itemId,
            movimiento.bodegaOrigenId!,
          );

          if (updatedOrigenItemBodega) {
            await movimientosRepository.actualizarSnapshotDetalle(
              movimientoId,
              detalle.itemId,
              {
                stockResultante: updatedOrigenItemBodega.stockActual,
                costoPromedioResultante: updatedOrigenItemBodega.costoPromedio,
                valorTotalResultante: updatedOrigenItemBodega.stockActual * updatedOrigenItemBodega.costoPromedio,
              },
              'origen',
            );
          }

          const [destinoExistente] = await tx
              .select()
              .from(itemBodegas)
              .where(
                and(
                  eq(itemBodegas.itemId, detalle.itemId),
                  eq(itemBodegas.bodegaId, movimiento.bodegaDestinoId!)
                )
              )
              .limit(1);

          const cantidadAnteriorDestino = destinoExistente?.stockActual ?? 0;
          const costoAnteriorDestino = destinoExistente?.costoPromedio ?? 0;

          await weightedAverageService.updateStockAndAverageCost(
            movimiento.bodegaDestinoId!,
            "entrada",
            [{ itemId: detalle.itemId, cantidad: detalle.cantidad, costoUnitario: origen.costoPromedio }],
            tx
          );

          const [updatedItemBodegaDestino] = await tx
              .select()
              .from(itemBodegas)
              .where(
                and(
                  eq(itemBodegas.itemId, detalle.itemId),
                  eq(itemBodegas.bodegaId, movimiento.bodegaDestinoId!)
                )
              )
              .limit(1);


          if (updatedItemBodegaDestino && updatedItemBodegaDestino.costoPromedio !== costoAnteriorDestino) {
            await registrarAuditoriaCosto(
              updatedItemBodegaDestino,
              movimientoId,
              usuarioId,
              cantidadAnteriorDestino,
              updatedItemBodegaDestino.stockActual,
              costoAnteriorDestino,
              updatedItemBodegaDestino.costoPromedio,
            );
          }

          // Guardar snapshot del destino después de la entrada
          if (updatedItemBodegaDestino) {
            await movimientosRepository.actualizarSnapshotDetalle(
              movimientoId,
              detalle.itemId,
              {
                stockResultante: updatedItemBodegaDestino.stockActual,
                costoPromedioResultante: updatedItemBodegaDestino.costoPromedio,
                valorTotalResultante: updatedItemBodegaDestino.stockActual * updatedItemBodegaDestino.costoPromedio,
              },
              'destino',
            );
          }
        }
      }

      if (movimiento.tipo === "ajuste") {
        throw new Error("CONFLICT");
      }

      const actualizado = await movimientosRepository.actualizarEstado(
        movimientoId,
        "publicado",
      );

      await auditLogService.registrarEvento({
        entidad: "movimiento",
        entidadId: movimientoId,
        accion: "publicar",
        usuarioId,
        fecha: new Date(),
        metadata: {
          tipo: movimiento.tipo,
          subTipo: movimiento.subTipo,
        },
      });

      return actualizado;
    });
  };

  const anularMovimiento = async ({
    movimientoId,
    usuarioId,
    motivo,
  }: {
    movimientoId: string;
    usuarioId: string;
    motivo?: string;
  }) => {
    const movimiento = await movimientosRepository.obtenerPorId(movimientoId);

    if (!movimiento) {
      throw new Error("NOT_FOUND");
    }

    if (movimiento.estado !== "publicado") {
      throw new Error("CONFLICT");
    }

    const actualizado = await movimientosRepository.actualizarEstado(
      movimientoId,
      "anulado",
    );

    await auditLogService.registrarEvento({
      entidad: "movimiento",
      entidadId: movimientoId,
      accion: "anular",
      usuarioId,
      fecha: new Date(),
      metadata: {
        motivo,
      },
    });

    return actualizado;
  };

  return {
    publicarMovimiento,
    anularMovimiento,
  };
};
