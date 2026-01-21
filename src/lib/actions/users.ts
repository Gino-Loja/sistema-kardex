"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import {
  emailSchema,
  estadoSchema,
  idSchema,
  nonEmptyStringSchema,
} from "@/lib/validations/common";
import { ROLES } from "@/lib/auth/roles";

const resolveSessionUser = async () => {
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
    "users:manage",
  );
};

const fetchUserWithRole = async (userId: string) => {
  const response = await auth.api.listUsers({
    headers: await headers(),
    query: {
      filterField: "id",
      filterOperator: "eq",
      filterValue: userId,
      limit: 1,
    },
  });

  return response.users[0] ?? null;
};

const usuarioCreateSchema = z.object({
  email: emailSchema,
  nombre: nonEmptyStringSchema,
  rolId: z.enum(ROLES),
  estado: estadoSchema.optional(),
  contrasenaTemporal: nonEmptyStringSchema.optional(),
});

const usuarioUpdateSchema = usuarioCreateSchema.partial().extend({
  id: idSchema,
});

const idPayloadSchema = z.object({ id: idSchema });

export const crearUsuario = async (input: unknown) => {
  await resolveSessionUser();
  const data = usuarioCreateSchema.parse(input);

  if (!data.contrasenaTemporal) {
    throw new Error("INVALID_PASSWORD");
  }

  const response = await auth.api.createUser({
    headers: await headers(),
    body: {
      email: data.email,
      name: data.nombre,
      password: data.contrasenaTemporal,
      role: data.rolId,
    },
  });

  if (data.estado === "inactivo") {
    await auth.api.banUser({
      headers: await headers(),
      body: {
        userId: response.user.id,
        banReason: "Usuario inactivo",
      },
    });
  }

  return response.user;
};

export const actualizarUsuario = async (input: unknown) => {
  await resolveSessionUser();
  const data = usuarioUpdateSchema.parse(input);
  const { id, ...rest } = data;
  const requestHeaders = await headers();

  if (rest.nombre) {
    await auth.api.adminUpdateUser({
      headers: requestHeaders,
      body: {
        userId: id,
        data: {
          name: rest.nombre,
        },
      },
    });
  }

  if (rest.rolId) {
    await auth.api.setRole({
      headers: requestHeaders,
      body: {
        userId: id,
        role: rest.rolId,
      },
    });
  }

  if (rest.estado) {
    if (rest.estado === "inactivo") {
      await auth.api.banUser({
        headers: requestHeaders,
        body: {
          userId: id,
          banReason: "Usuario inactivo",
        },
      });
    } else {
      await auth.api.unbanUser({
        headers: requestHeaders,
        body: {
          userId: id,
        },
      });
    }
  }

  return fetchUserWithRole(id);
};

export const desactivarUsuario = async (input: unknown) => {
  await resolveSessionUser();
  const { id } = idPayloadSchema.parse(input);

  await auth.api.banUser({
    headers: await headers(),
    body: {
      userId: id,
      banReason: "Usuario inactivo",
    },
  });

  return fetchUserWithRole(id);
};
