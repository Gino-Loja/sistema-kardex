"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { randomUUID } from "crypto";
import { createAuditLogService } from "@/lib/dal/services/audit-log.service";
import { createMovementsService } from "@/lib/dal/services/movements.service";
import { itemBodegasRepository } from "@/lib/dal/repositories/item-bodegas.repository";
import { movimientosRepository } from "@/lib/dal/repositories/movimientos.repository";
import {
  movimientoCreateSchema,
  movimientoPublishSchema,
  movimientoUpdateSchema,
} from "@/lib/validations/movements";

import { itemsRepository } from "@/lib/dal/repositories/items.repository";
import { bodegasRepository } from "@/lib/dal/repositories/bodegas.repository";

const resolveSessionUser = async (permission: Parameters<
  typeof requirePermission
>[1]) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return requirePermission(
    user
      ? {
          user: {
            id: user.id,
            role: user.role ?? null,
            email: user.email ?? null,
          },
        }
      : null,
    permission,
  );
};

const auditLogService = createAuditLogService({
  create: async (input) => ({
    id: input.id ?? randomUUID(),
    ...input,
  }),
});

const movementsService = createMovementsService({
  movimientosRepository,
  itemBodegaRepository: itemBodegasRepository,
  itemsRepository: itemsRepository,
  bodegasRepository,
  auditLogService,
});

export const crearMovimiento = async (input: unknown) => {
  const user = await resolveSessionUser("movements:write");
  const data = movimientoCreateSchema.parse(input);

  return movimientosRepository.crear({
    ...data,
    usuarioId: user.id,
    estado: "borrador",
    detalles: data.detalles.map((detalle) => ({
      itemId: detalle.itemId,
      cantidad: detalle.cantidad,
      costoUnitario: detalle.costoUnitario ?? null,
      costoTotal:
        detalle.costoUnitario != null
          ? detalle.cantidad * detalle.costoUnitario
          : null,
    })),
  });
};

export const actualizarMovimiento = async (input: unknown) => {
  const user = await resolveSessionUser("movements:write");
  const data = movimientoUpdateSchema.parse(input);
  const { id, ...rest } = data;

  return movimientosRepository.actualizar(id, {
    ...rest,
    usuarioId: user.id,
    detalles: data.detalles?.map((detalle) => ({
      itemId: detalle.itemId,
      cantidad: detalle.cantidad,
      costoUnitario: detalle.costoUnitario ?? null,
      costoTotal:
        detalle.costoUnitario != null
          ? detalle.cantidad * detalle.costoUnitario
          : null,
    })),
  });
};

export const publicarMovimiento = async (input: unknown) => {
  const user = await resolveSessionUser("movements:write");
  const data = movimientoPublishSchema.parse(input);

  return movementsService.publicarMovimiento({
    movimientoId: data.movimientoId,
    usuarioId: user.id,
    permitirNegativo: data.permitirNegativo,
  });
};

export const anularMovimiento = async (input: unknown) => {
  const user = await resolveSessionUser("movements:write");
  const data = movimientoPublishSchema.parse(input);

  return movementsService.anularMovimiento({
    movimientoId: data.movimientoId,
    usuarioId: user.id,
    motivo: data.motivo,
  });
};
