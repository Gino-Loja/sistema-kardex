import { desc, sql, and, eq, lt, isNotNull } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import {
  itemBodegas,
  movimientos,
  items,
  detalleMovimientos,
} from "@/lib/drizzle/schema";

export type AlertaStock = {
  id: string;
  itemId: string;
  nombre: string;
  codigo: string;
  stockActual: number;
  stockMinimo: number;
  nivel: "critico" | "bajo";
};

export type TendenciaRotacion = {
  mes: string;
  real: number;
  proyectado: number;
};

export type DashboardResumen = {
  existenciasTotales: number;
  valorizacionTotal: number;
  rotacionInventario: number;
  alertasStockCritico: number;
  variacionStock: number;
  variacionValorizacion: number;
  variacionRotacion: number;
  alertasDetalladas: AlertaStock[];
  tendenciaRotacion: TendenciaRotacion[];
  ultimosMovimientos: Array<{
    id: string;
    tipo: string;
    estado: string;
    fecha: Date;
  }>;
};

export const getDashboardSummary = async (): Promise<DashboardResumen> => {
  const [{ totalStock }] = await db
    .select({
      totalStock: sql<number>`coalesce(sum(${itemBodegas.stockActual}), 0)`,
    })
    .from(itemBodegas);

  const [{ totalValorizacion }] = await db
    .select({
      totalValorizacion: sql<number>`coalesce(sum(${itemBodegas.stockActual} * ${itemBodegas.costoPromedio}), 0)`,
    })
    .from(itemBodegas);

  const [{ alertas }] = await db
    .select({
      alertas: sql<number>`coalesce(sum(case when ${itemBodegas.stockMinimo} is not null and ${itemBodegas.stockActual} < ${itemBodegas.stockMinimo} then 1 else 0 end), 0)`,
    })
    .from(itemBodegas);

  // Obtener alertas detalladas (items bajo stock mínimo)
  const alertasDetalladas = await db
    .select({
      id: itemBodegas.id,
      itemId: itemBodegas.itemId,
      nombre: items.nombre,
      codigo: items.codigo,
      stockActual: itemBodegas.stockActual,
      stockMinimo: itemBodegas.stockMinimo,
    })
    .from(itemBodegas)
    .innerJoin(items, eq(itemBodegas.itemId, items.id))
    .where(
      and(
        isNotNull(itemBodegas.stockMinimo),
        lt(itemBodegas.stockActual, itemBodegas.stockMinimo)
      )
    )
    .orderBy(itemBodegas.stockActual)
    .limit(10);

  // Calcular rotación de inventario (costo de ventas / inventario promedio)
  // Simplificado: total salidas del año / stock actual
  const [{ costoVentas }] = await db
    .select({
      costoVentas: sql<number>`coalesce(sum(${detalleMovimientos.costoTotal}), 0)`,
    })
    .from(detalleMovimientos)
    .innerJoin(
      movimientos,
      eq(detalleMovimientos.movimientoId, movimientos.id)
    )
    .where(
      and(
        eq(movimientos.tipo, "salida"),
        eq(movimientos.estado, "confirmado"),
        sql`${movimientos.fecha} >= NOW() - INTERVAL '1 year'`
      )
    );

  const inventarioPromedio = Number(totalValorizacion) || 1;
  const rotacionInventario =
    inventarioPromedio > 0
      ? Number(costoVentas) / inventarioPromedio
      : 0;

  // Generar tendencia de rotación (últimos 6 meses - datos simulados basados en movimientos reales)
  const meses = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const tendenciaRotacion: TendenciaRotacion[] = meses.map((mes, index) => ({
    mes,
    real: Math.round(rotacionInventario * (0.7 + index * 0.08) * 100) / 100,
    proyectado:
      Math.round(rotacionInventario * (0.75 + index * 0.1) * 100) / 100,
  }));

  const ultimosMovimientos = await db
    .select({
      id: movimientos.id,
      tipo: movimientos.tipo,
      estado: movimientos.estado,
      fecha: movimientos.fecha,
    })
    .from(movimientos)
    .orderBy(desc(movimientos.fecha))
    .limit(5);

  // Variaciones (simuladas - en producción vendrían de comparación con mes anterior)
  const variacionStock = 2.5;
  const variacionValorizacion = 1.2;
  const variacionRotacion = -0.5;

  return {
    existenciasTotales: Number(totalStock ?? 0),
    valorizacionTotal: Number(totalValorizacion ?? 0),
    rotacionInventario: Math.round(rotacionInventario * 10) / 10,
    alertasStockCritico: Number(alertas ?? 0),
    variacionStock,
    variacionValorizacion,
    variacionRotacion,
    alertasDetalladas: alertasDetalladas.map((a) => ({
      ...a,
      stockActual: Number(a.stockActual),
      stockMinimo: Number(a.stockMinimo),
      nivel:
        Number(a.stockActual) < Number(a.stockMinimo) * 0.5
          ? ("critico" as const)
          : ("bajo" as const),
    })),
    tendenciaRotacion,
    ultimosMovimientos,
  };
};
