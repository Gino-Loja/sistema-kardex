import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import { detalleMovimientos, movimientos } from "@/lib/drizzle/schema";

export type KardexEntry = {
  fecha: Date;
  tipoMovimiento: string;
  cantidadEntrada: number;
  cantidadSalida: number;
  saldoFisico: number;
  costoPromedio: number;
  saldoValorizado: number;
};

type KardexQueryInput = {
  itemId: string;
  desde?: Date;
  hasta?: Date;
};

const resolveMovimientoCantidad = (tipo: string) => {
  if (tipo === "entrada" || tipo === "ajuste") {
    return "entrada" as const;
  }

  if (tipo === "salida") {
    return "salida" as const;
  }

  return "neutro" as const;
};

export const getKardexReport = async ({
  itemId,
  desde,
  hasta,
}: KardexQueryInput): Promise<KardexEntry[]> => {
  const conditions = [
    eq(detalleMovimientos.itemId, itemId),
    eq(movimientos.estado, "publicado"),
  ];

  if (desde) {
    conditions.push(gte(movimientos.fecha, desde));
  }

  if (hasta) {
    conditions.push(lte(movimientos.fecha, hasta));
  }

  const rows = await db
    .select({
      fecha: movimientos.fecha,
      tipo: movimientos.tipo,
      cantidad: detalleMovimientos.cantidad,
      costoUnitario: detalleMovimientos.costoUnitario,
    })
    .from(movimientos)
    .innerJoin(
      detalleMovimientos,
      eq(detalleMovimientos.movimientoId, movimientos.id),
    )
    .where(and(...conditions))
    .orderBy(asc(movimientos.fecha));

  let saldoFisico = 0;
  let costoPromedio = 0;

  return rows.map((row) => {
    const tipoMovimiento = resolveMovimientoCantidad(row.tipo);
    let cantidadEntrada = 0;
    let cantidadSalida = 0;

    if (tipoMovimiento === "entrada") {
      cantidadEntrada = Number(row.cantidad);
      const costoUnitario = Number(row.costoUnitario ?? 0);
      const nuevoSaldo = saldoFisico + cantidadEntrada;
      if (nuevoSaldo > 0) {
        costoPromedio =
          (saldoFisico * costoPromedio + cantidadEntrada * costoUnitario) /
          nuevoSaldo;
      } else {
        costoPromedio = 0;
      }
      saldoFisico = nuevoSaldo;
    } else if (tipoMovimiento === "salida") {
      cantidadSalida = Number(row.cantidad);
      saldoFisico -= cantidadSalida;
    }

    const saldoValorizado = saldoFisico * costoPromedio;

    return {
      fecha: row.fecha,
      tipoMovimiento: row.tipo,
      cantidadEntrada,
      cantidadSalida,
      saldoFisico,
      costoPromedio,
      saldoValorizado,
    };
  });
};
