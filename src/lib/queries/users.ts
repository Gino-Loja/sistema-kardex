import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { ROLES } from "@/lib/auth/roles";

export const listUsuarios = async ({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const offset = (page - 1) * pageSize;
  const response = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: pageSize,
      offset,
      sortBy: "name",
      sortDirection: "asc",
    },
  });

  return {
    items: response.users.map((user) => {
      // Cast to access admin plugin fields (banned, role)
      const extendedUser = user as typeof user & { banned?: boolean; role?: string };
      return {
        id: user.id,
        email: user.email,
        nombre: user.name,
        estado: extendedUser.banned ? "inactivo" : "activo",
        rolId: extendedUser.role ?? "bodeguero",
        rolNombre: extendedUser.role ?? "bodeguero",
      };
    }),
    total: response.total,
  };
};

export const getUsuarioById = async (id: string) => {
  const user = await auth.api.getUser({
    headers: await headers(),
    query: {
      id,
    },
  });

  // Cast to access admin plugin fields (banned, role)
  const extendedUser = user as typeof user & { banned?: boolean; role?: string };

  return {
    id: user.id,
    email: user.email,
    nombre: user.name,
    estado: extendedUser.banned ? "inactivo" : "activo",
    rolId: extendedUser.role ?? "bodeguero",
    rolNombre: extendedUser.role ?? "bodeguero",
  };
};

export const listRoles = async () => {
  return ROLES.map((role) => ({
    id: role,
    nombre: role,
  }));
};
