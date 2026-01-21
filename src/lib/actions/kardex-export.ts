"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { formatCsv } from "@/lib/queries/csv";
import { getKardexReport } from "@/lib/queries/kardex";

export const exportKardexCsv = async (formData: FormData): Promise<void> => {
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
    "reports:read",
  );

  const itemId = formData.get("itemId") as string;
  const desdeStr = formData.get("desde") as string | null;
  const hastaStr = formData.get("hasta") as string | null;

  const desde = desdeStr ? new Date(desdeStr) : undefined;
  const hasta = hastaStr ? new Date(hastaStr) : undefined;
  const report = await getKardexReport({
    itemId,
    desde,
    hasta,
  });

  const headersRow = [
    "fecha",
    "tipo",
    "entrada",
    "salida",
    "saldo_fisico",
    "costo_promedio",
    "saldo_valorizado",
  ];

  const rows = report.map((entry) => [
    entry.fecha.toISOString(),
    entry.tipoMovimiento,
    entry.cantidadEntrada.toString(),
    entry.cantidadSalida.toString(),
    entry.saldoFisico.toString(),
    entry.costoPromedio.toFixed(4),
    entry.saldoValorizado.toFixed(4),
  ]);

  // TODO: CSV export needs to be refactored to use an API route for file download
  formatCsv(headersRow, rows);
};
