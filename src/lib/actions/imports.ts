"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/drizzle/db";
import { categorias, items } from "@/lib/drizzle/schema";
import { importItemRowSchema } from "@/lib/validations/imports";
import { audit } from "@/lib/services/audit.service";

type ImportResult = {
  inserted: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
};

const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === "\"") {
      const next = content[i + 1];
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[i + 1] === "\n") {
        i += 1;
      }
      row.push(current);
      current = "";
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((value) => value.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
};

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

type HeaderKey =
  | "codigo"
  | "nombre"
  | "descripcion"
  | "unidad_medida"
  | "categoria"
  | "costo_promedio"
  | "estado"
  | "imagen_url";

const HEADER_MAP: Record<string, HeaderKey> = {
  codigo: "codigo",
  nombre: "nombre",
  descripcion: "descripcion",
  unidad_medida: "unidad_medida",
  unidadmedida: "unidad_medida",
  categoria: "categoria",
  costo_promedio: "costo_promedio",
  costopromedio: "costo_promedio",
  estado: "estado",
  imagen_url: "imagen_url",
  imagenurl: "imagen_url",
};

const mapHeaders = (headers: string[]): Array<HeaderKey | undefined> =>
  headers.map((header) => HEADER_MAP[normalizeHeader(header)]);

const parseNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const resolveSessionUser = async () => {
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
    "masters:write",
  );

  return {
    ...validatedUser,
    nombre: user?.name ?? user?.email ?? "Usuario",
  };
};

export const importItemsFromCsv = async (
  formData: FormData,
): Promise<ImportResult> => {
  const user = await resolveSessionUser();

  const file = formData.get("archivo");
  if (!(file instanceof File)) {
    return {
      inserted: 0,
      updated: 0,
      errors: [{ row: 0, message: "Archivo requerido" }],
    };
  }

  const content = await file.text();
  const rows = parseCsv(content);

  if (rows.length === 0) {
    return {
      inserted: 0,
      updated: 0,
      errors: [{ row: 0, message: "CSV vacio" }],
    };
  }

  const headerRow = rows[0];
  const headerKeys = mapHeaders(headerRow);

  if (!headerKeys.includes("codigo") || !headerKeys.includes("descripcion")) {
    return {
      inserted: 0,
      updated: 0,
      errors: [{ row: 1, message: "Encabezados requeridos: codigo, descripcion" }],
    };
  }

  if (!headerKeys.includes("unidad_medida")) {
    return {
      inserted: 0,
      updated: 0,
      errors: [{ row: 1, message: "Encabezado requerido: unidad_medida" }],
    };
  }

  let inserted = 0;
  let updated = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const record: Record<string, string> = {};

    headerKeys.forEach((key, index) => {
      if (!key) {
        return;
      }
      record[key] = row[index]?.trim() ?? "";
    });

    const parsed = importItemRowSchema.safeParse({
      codigo: record.codigo,
      nombre: record.nombre || record.descripcion,
      descripcion: record.descripcion,
      unidadMedida: record.unidad_medida,
      categoria: record.categoria || undefined,
      costoPromedio: parseNumber(record.costo_promedio ?? ""),
      estado: record.estado || undefined,
      imagenUrl: record.imagen_url || undefined,
    });

    if (!parsed.success) {
      errors.push({
        row: rowIndex + 1,
        message: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      continue;
    }

    const data = parsed.data;
    let categoriaId: string | null = null;

    if (data.categoria) {
      const [existingCategory] = await db
        .select()
        .from(categorias)
        .where(eq(categorias.nombre, data.categoria))
        .limit(1);

      if (existingCategory) {
        categoriaId = existingCategory.id;
      } else {
        const newId = randomUUID();
        await db.insert(categorias).values({
          id: newId,
          nombre: data.categoria,
          estado: "activo",
        });
        categoriaId = newId;
      }
    }

    const [existente] = await db
      .select()
      .from(items)
      .where(eq(items.codigo, data.codigo))
      .limit(1);

    if (existente) {
      await db
        .update(items)
        .set({
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidadMedida: data.unidadMedida,
          categoriaId,
          costoPromedio: data.costoPromedio ?? 0,
          estado: data.estado ?? "activo",
          imagenUrl: data.imagenUrl ?? null,
          actualizadoEn: new Date(),
        })
        .where(eq(items.id, existente.id));
      updated += 1;
    } else {
      await db.insert(items).values({
        id: randomUUID(),
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        unidadMedida: data.unidadMedida,
        categoriaId,
        costoPromedio: data.costoPromedio ?? 0,
        estado: data.estado ?? "activo",
        imagenUrl: data.imagenUrl ?? null,
      });
      inserted += 1;
    }
  }

  // Registrar en auditoría solo si hubo cambios
  if (inserted > 0 || updated > 0) {
    await audit.importar(
      "item",
      `Importación CSV: ${inserted} items creados, ${updated} actualizados`,
      { id: user.id, nombre: user.nombre },
      { inserted, updated, errorsCount: errors.length },
    );
  }

  return {
    inserted,
    updated,
    errors,
  };
};
