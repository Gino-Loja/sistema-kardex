"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { bodegasRepository } from "@/lib/dal/repositories/bodegas.repository";
import { itemsRepository } from "@/lib/dal/repositories/items.repository";
import { tercerosRepository } from "@/lib/dal/repositories/terceros.repository";
import {
  bodegaCreateSchema,
  bodegaUpdateSchema,
  itemCreateSchema,
  itemUpdateSchema,
  terceroCreateSchema,
  terceroUpdateSchema,
} from "@/lib/validations/masters";
import { idSchema } from "@/lib/validations/common";
import { audit } from "@/lib/services/audit.service";

const resolveSessionUser = async (permission: Parameters<
  typeof requirePermission
>[1]) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  const validatedUser = requirePermission(
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

  return {
    ...validatedUser,
    nombre: user?.name ?? user?.email ?? "Usuario",
  };
};

const idPayloadSchema = z.object({ id: idSchema });

export const crearItem = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = itemCreateSchema.parse(input);

  const item = await itemsRepository.crear({
    ...data,
    costoPromedio: data.costoPromedio ?? 0,
    estado: data.estado ?? "activo",
  });

  await audit.crear("item", item.id, `Item creado: ${data.codigo} - ${data.nombre}`, { id: user.id, nombre: user.nombre });

  return item;
};

export const actualizarItem = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = itemUpdateSchema.parse(input);
  const { id, ...rest } = data;

  const item = await itemsRepository.actualizar(id, rest);

  await audit.editar("item", id, `Item actualizado: ${item?.codigo ?? id}`, { id: user.id, nombre: user.nombre });

  return item;
};

export const desactivarItem = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const { id } = idPayloadSchema.parse(input);

  const item = await itemsRepository.desactivar(id);

  await audit.eliminar("item", id, `Item desactivado: ${item?.codigo ?? id}`, { id: user.id, nombre: user.nombre });

  return item;
};

export const crearBodega = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = bodegaCreateSchema.parse(input);

  const bodega = await bodegasRepository.crear({
    ...data,
    estado: data.estado ?? "activo",
  });

  await audit.crear("bodega", bodega.id, `Bodega creada: ${data.identificacion} - ${data.nombre}`, { id: user.id, nombre: user.nombre });

  return bodega;
};

export const actualizarBodega = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = bodegaUpdateSchema.parse(input);
  const { id, ...rest } = data;

  const bodega = await bodegasRepository.actualizar(id, rest);

  await audit.editar("bodega", id, `Bodega actualizada: ${bodega?.identificacion ?? id}`, { id: user.id, nombre: user.nombre });

  return bodega;
};

export const desactivarBodega = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const { id } = idPayloadSchema.parse(input);

  const bodega = await bodegasRepository.desactivar(id);

  await audit.eliminar("bodega", id, `Bodega desactivada: ${bodega?.identificacion ?? id}`, { id: user.id, nombre: user.nombre });

  return bodega;
};

export const crearTercero = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = terceroCreateSchema.parse(input);

  const tercero = await tercerosRepository.crear({
    ...data,
    estado: data.estado ?? "activo",
  });

  await audit.crear("tercero", tercero.id, `Tercero creado: ${data.nombre}`, { id: user.id, nombre: user.nombre });

  return tercero;
};

export const actualizarTercero = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const data = terceroUpdateSchema.parse(input);
  const { id, ...rest } = data;

  const tercero = await tercerosRepository.actualizar(id, rest);

  await audit.editar("tercero", id, `Tercero actualizado: ${tercero?.nombre ?? id}`, { id: user.id, nombre: user.nombre });

  return tercero;
};

export const desactivarTercero = async (input: unknown) => {
  const user = await resolveSessionUser("masters:write");
  const { id } = idPayloadSchema.parse(input);

  const tercero = await tercerosRepository.desactivar(id);

  await audit.eliminar("tercero", id, `Tercero desactivado: ${tercero?.nombre ?? id}`, { id: user.id, nombre: user.nombre });

  return tercero;
};
