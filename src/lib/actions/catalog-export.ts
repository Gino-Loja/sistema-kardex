"use server";

import { headers } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/drizzle/db";
import { categorias, items } from "@/lib/drizzle/schema";
import { formatCsv } from "@/lib/queries/csv";

export const exportCatalogCsv = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  requirePermission(
    user
      ? {
          user: {
            id: user.id,
            role: user.role ?? null,
            email: user.email ?? null,
          },
        }
      : null,
    "masters:write",
  );

  const rows = await db
    .select({
      codigo: items.codigo,
      nombre: items.nombre,
      descripcion: items.descripcion,
      unidadMedida: items.unidadMedida,
      categoriaNombre: categorias.nombre,
      costoPromedio: items.costoPromedio,
      estado: items.estado,
      imagenUrl: items.imagenUrl,
    })
    .from(items)
    .leftJoin(categorias, eq(items.categoriaId, categorias.id))
    .orderBy(asc(items.codigo));

  const headersRow = [
    "codigo",
    "nombre",
    "descripcion",
    "unidad_medida",
    "categoria",
    "costo_promedio",
    "estado",
    "imagen_url",
  ];

  const dataRows = rows.map((item) => [
    item.codigo,
    item.nombre,
    item.descripcion,
    item.unidadMedida,
    item.categoriaNombre ?? "",
    item.costoPromedio?.toString() ?? "0",
    item.estado ?? "activo",
    item.imagenUrl ?? "",
  ]);

  return formatCsv(headersRow, dataRows);
};
