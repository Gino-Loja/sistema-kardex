import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import {
  movimientos,
  detalleMovimientos,
  items,
  itemBodegas,
  categorias,
  user,
  auditoriaCostoPromedio,
} from "@/lib/drizzle/schema";
import type {
  KardexRow,
  KardexResponse,
  ItemInfo,
  KardexResumen,
  Pagination,
  AuditoriaRow,
  AuditoriaResponse,
} from "@/lib/types/kardex";
import type { KardexQuery, AuditoriaQuery } from "@/lib/validators/kardex";

/**
 * Obtiene la información básica de un ítem
 */
export const getItemInfo = async (itemId: string): Promise<ItemInfo | null> => {
  const [item] = await db
    .select({
      id: items.id,
      codigo: items.codigo,
      nombre: items.nombre,
      unidadMedida: items.unidadMedida,
      categoriaId: items.categoriaId,
    })
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);

  if (!item) return null;

  let categoriaNombre: string | null = null;
  if (item.categoriaId) {
    const [cat] = await db
      .select({ nombre: categorias.nombre })
      .from(categorias)
      .where(eq(categorias.id, item.categoriaId))
      .limit(1);
    categoriaNombre = cat?.nombre ?? null;
  }

  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    unidadMedida: item.unidadMedida,
    categoria: categoriaNombre,
  };
};

/**
 * Obtiene el stock y costo promedio actual de un ítem en una bodega
 */
export const getItemBodegaInfo = async (
  itemId: string,
  bodegaId?: string,
): Promise<{ stockActual: number; costoPromedio: number } | null> => {
  const conditions = [eq(itemBodegas.itemId, itemId)];
  if (bodegaId) {
    conditions.push(eq(itemBodegas.bodegaId, bodegaId));
  }

  const [result] = await db
    .select({
      stockActual: itemBodegas.stockActual,
      costoPromedio: itemBodegas.costoPromedio,
    })
    .from(itemBodegas)
    .where(and(...conditions))
    .limit(1);

  return result ?? null;
};

/**
 * Calcula el saldo inicial (stock que existe en item_bodegas pero no tiene movimiento)
 * Esto ocurre cuando se asignan items a bodegas con stock inicial sin crear movimiento
 */
const calcularSaldoInicial = async (
  itemId: string,
  bodegaId: string | undefined,
): Promise<{ stockInicial: number; costoInicial: number; fechaCreacion: Date } | null> => {
  // Solo calcular saldo inicial si hay filtro de bodega
  if (!bodegaId) return null;

  // Obtener el registro de item_bodega con los campos de saldo inicial histórico
  const [itemBodegaRecord] = await db
    .select({
      stockActual: itemBodegas.stockActual,
      costoPromedio: itemBodegas.costoPromedio,
      stockInicial: itemBodegas.stockInicial,
      costoInicial: itemBodegas.costoInicial,
      creadoEn: itemBodegas.creadoEn,
    })
    .from(itemBodegas)
    .where(and(eq(itemBodegas.itemId, itemId), eq(itemBodegas.bodegaId, bodegaId)))
    .limit(1);

  if (!itemBodegaRecord) {
    return null;
  }

  // Si tenemos saldo inicial histórico guardado, usarlo directamente
  if (itemBodegaRecord.stockInicial != null && itemBodegaRecord.costoInicial != null) {
    return {
      stockInicial: itemBodegaRecord.stockInicial,
      costoInicial: itemBodegaRecord.costoInicial,
      fechaCreacion: itemBodegaRecord.creadoEn,
    };
  }

  // Fallback: calcular dinámicamente para registros antiguos sin saldo inicial guardado
  if (itemBodegaRecord.stockActual === 0) {
    return null;
  }

  // Calcular el stock neto de los movimientos publicados
  const movimientosConditions = [
    eq(detalleMovimientos.itemId, itemId),
    eq(movimientos.estado, "publicado"),
    sql`(${movimientos.bodegaOrigenId} = ${bodegaId} OR ${movimientos.bodegaDestinoId} = ${bodegaId})`,
  ];

  const movimientosData = await db
    .select({
      tipo: movimientos.tipo,
      cantidad: detalleMovimientos.cantidad,
      bodegaOrigenId: movimientos.bodegaOrigenId,
      bodegaDestinoId: movimientos.bodegaDestinoId,
    })
    .from(detalleMovimientos)
    .innerJoin(movimientos, eq(detalleMovimientos.movimientoId, movimientos.id))
    .where(and(...movimientosConditions));

  // Calcular stock neto de movimientos
  let stockNetoMovimientos = 0;
  for (const mov of movimientosData) {
    const esEntrada = mov.tipo === "entrada" || (mov.tipo === "transferencia" && mov.bodegaDestinoId === bodegaId);
    const esSalida = mov.tipo === "salida" || (mov.tipo === "transferencia" && mov.bodegaOrigenId === bodegaId);

    if (esEntrada) {
      stockNetoMovimientos += mov.cantidad;
    }
    if (esSalida) {
      stockNetoMovimientos -= mov.cantidad;
    }
  }

  // El saldo inicial es la diferencia entre el stock actual y el neto de movimientos
  const stockInicial = itemBodegaRecord.stockActual - stockNetoMovimientos;

  // Si no hay diferencia, no hay saldo inicial
  if (stockInicial <= 0) {
    return null;
  }

  // NOTA: Para registros antiguos sin saldo inicial guardado, usamos el costo promedio actual
  // Esto no es exacto pero es el mejor fallback disponible
  return {
    stockInicial,
    costoInicial: itemBodegaRecord.costoPromedio,
    fechaCreacion: itemBodegaRecord.creadoEn,
  };
};

/**
 * Obtiene los movimientos de un ítem para la vista Kárdex
 * con cálculo de existencias acumuladas (running totals)
 */
export const getKardexData = async (query: KardexQuery): Promise<KardexResponse> => {
  const { itemId, bodegaId, fechaDesde, fechaHasta, tipo, page = 1, pageSize = 100 } = query;

  // Validar que el ítem existe
  const itemInfo = await getItemInfo(itemId);
  if (!itemInfo) {
    throw new Error("ITEM_NOT_FOUND");
  }

  // Calcular saldo inicial (stock en bodega sin movimiento correspondiente)
  const saldoInicial = await calcularSaldoInicial(itemId, bodegaId);

  // Construir condiciones de búsqueda
  const conditions = [
    eq(detalleMovimientos.itemId, itemId),
    eq(movimientos.estado, "publicado"),
  ];

  if (fechaDesde) {
    conditions.push(gte(movimientos.fecha, fechaDesde));
  }

  if (fechaHasta) {
    conditions.push(lte(movimientos.fecha, fechaHasta));
  }

  if (tipo) {
    conditions.push(eq(movimientos.tipo, tipo));
  }

  // Filtro por bodega
  if (bodegaId) {
    // Un movimiento está relacionado con una bodega si es origen o destino
    conditions.push(
      sql`(${movimientos.bodegaOrigenId} = ${bodegaId} OR ${movimientos.bodegaDestinoId} = ${bodegaId})`,
    );
  }

  // Obtener total de registros (incluyendo fila de saldo inicial si existe)
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(detalleMovimientos)
    .innerJoin(movimientos, eq(detalleMovimientos.movimientoId, movimientos.id))
    .where(and(...conditions));

  const totalMovimientos = Number(count);
  const tieneSaldoInicial = saldoInicial !== null && page === 1;
  const total = totalMovimientos + (saldoInicial !== null ? 1 : 0);
  const totalPages = Math.ceil(total / pageSize);

  // Ajustar límite y offset para la fila de saldo inicial
  const ajusteOffset = tieneSaldoInicial ? 1 : 0;
  const limitMovimientos = tieneSaldoInicial ? pageSize - 1 : pageSize;
  const offsetMovimientos = page === 1 ? 0 : (page - 1) * pageSize - (saldoInicial !== null ? 1 : 0);

  // Obtener movimientos con detalles y snapshots
  const rawData = await db
    .select({
      movimientoId: movimientos.id,
      tipo: movimientos.tipo,
      subTipo: movimientos.subTipo,
      fecha: movimientos.fecha,
      observacion: movimientos.observacion,
      bodegaOrigenId: movimientos.bodegaOrigenId,
      bodegaDestinoId: movimientos.bodegaDestinoId,
      cantidad: detalleMovimientos.cantidad,
      costoUnitario: detalleMovimientos.costoUnitario,
      costoTotal: detalleMovimientos.costoTotal,
      // Snapshots para destino (entradas, transferencias destino)
      stockResultante: detalleMovimientos.stockResultante,
      costoPromedioResultante: detalleMovimientos.costoPromedioResultante,
      valorTotalResultante: detalleMovimientos.valorTotalResultante,
      // Snapshots para origen (salidas, transferencias origen)
      stockResultanteOrigen: detalleMovimientos.stockResultanteOrigen,
      costoPromedioResultanteOrigen: detalleMovimientos.costoPromedioResultanteOrigen,
      valorTotalResultanteOrigen: detalleMovimientos.valorTotalResultanteOrigen,
    })
    .from(detalleMovimientos)
    .innerJoin(movimientos, eq(detalleMovimientos.movimientoId, movimientos.id))
    .where(and(...conditions))
    .orderBy(asc(movimientos.creadoEn))
    .limit(limitMovimientos > 0 ? limitMovimientos : pageSize)
    .offset(offsetMovimientos > 0 ? offsetMovimientos : 0);

  // Calcular existencias acumuladas (running totals)
  // Inicializar con saldo inicial si existe
  let existenciaAcumulada = saldoInicial?.stockInicial ?? 0;
  let costoPromedioActual = saldoInicial?.costoInicial ?? 0;

  // Si no es la primera página, calcular el estado inicial desde movimientos anteriores
  if (page > 1) {
    // Obtener todos los movimientos anteriores a esta página
    const movimientosAnteriores = await db
      .select({
        tipo: movimientos.tipo,
        cantidad: detalleMovimientos.cantidad,
        costoUnitario: detalleMovimientos.costoUnitario,
        bodegaOrigenId: movimientos.bodegaOrigenId,
        bodegaDestinoId: movimientos.bodegaDestinoId,
      })
      .from(detalleMovimientos)
      .innerJoin(movimientos, eq(detalleMovimientos.movimientoId, movimientos.id))
      .where(and(...conditions))
      .orderBy(asc(movimientos.creadoEn))
      .limit(offsetMovimientos > 0 ? offsetMovimientos : 0);

    // Calcular el estado acumulado
    for (const mov of movimientosAnteriores) {
      const esEntrada = mov.tipo === "entrada" ||
        (mov.tipo === "transferencia" && bodegaId && mov.bodegaDestinoId === bodegaId);
      const esSalida = mov.tipo === "salida" ||
        (mov.tipo === "transferencia" && bodegaId && mov.bodegaOrigenId === bodegaId);

      if (esEntrada) {
        const costoEntrada = mov.costoUnitario ?? costoPromedioActual;
        const valorAnterior = existenciaAcumulada * costoPromedioActual;
        const valorEntrada = mov.cantidad * costoEntrada;
        existenciaAcumulada += mov.cantidad;
        if (existenciaAcumulada > 0) {
          costoPromedioActual = (valorAnterior + valorEntrada) / existenciaAcumulada;
        }
      } else if (esSalida) {
        existenciaAcumulada -= mov.cantidad;
      }
    }
  }

  // Construir filas del Kárdex con existencias calculadas
  const kardexRows: KardexRow[] = [];
  let totalEntradas = 0;
  let totalSalidas = 0;

  // Agregar fila de saldo inicial si existe y es la primera página
  if (tieneSaldoInicial && saldoInicial) {
    const valorInicial = saldoInicial.stockInicial * saldoInicial.costoInicial;
    totalEntradas += valorInicial;

    // kardexRows.push({
    //   fecha: saldoInicial.fechaCreacion, // Usar fecha de creación del item_bodega
    //   detalle: "Saldo Inicial",
    //   numeroDocumento: null,
    //   entrada: {
    //     cantidad: saldoInicial.stockInicial,
    //     precioUnitario: saldoInicial.costoInicial,
    //     valor: valorInicial,
    //   },
    //   salida: null,
    //   existencia: {
    //     cantidad: saldoInicial.stockInicial,
    //     costoPromedio: saldoInicial.costoInicial,
    //     valor: valorInicial,
    //   },
    //   movimientoId: null,
    // });
  }

  for (const mov of rawData) {
    const esEntrada = mov.tipo === "entrada" ||
      (mov.tipo === "transferencia" && bodegaId && mov.bodegaDestinoId === bodegaId);
    const esSalida = mov.tipo === "salida" ||
      (mov.tipo === "transferencia" && bodegaId && mov.bodegaOrigenId === bodegaId);

    let entrada: KardexRow["entrada"] = null;
    let salida: KardexRow["salida"] = null;

    // Determinar si hay snapshot guardado para usar
    const tieneSnapshotDestino = mov.stockResultante != null && mov.costoPromedioResultante != null;
    const tieneSnapshotOrigen = mov.stockResultanteOrigen != null && mov.costoPromedioResultanteOrigen != null;

    const costoUnitario = mov.costoUnitario ?? costoPromedioActual;

    if (esEntrada) {
      const valor = mov.cantidad * costoUnitario;
      entrada = {
        cantidad: mov.cantidad,
        precioUnitario: costoUnitario,
        valor,
      };
      totalEntradas += valor;

      // Usar snapshot si existe, sino recalcular (para movimientos antiguos)
      if (tieneSnapshotDestino) {
        existenciaAcumulada = mov.stockResultante!;
        costoPromedioActual = mov.costoPromedioResultante!;
      } else {
        // Recalcular promedio para entradas (fallback)
        const valorAnterior = existenciaAcumulada * costoPromedioActual;
        existenciaAcumulada += mov.cantidad;
        if (existenciaAcumulada > 0) {
          costoPromedioActual = (valorAnterior + valor) / existenciaAcumulada;
        }
      }
    }

    if (esSalida) {
      // Para salidas, el costo unitario es el promedio ANTES de la salida
      // El snapshot guarda el estado DESPUÉS, así que debemos usar el costo actual
      const valor = mov.cantidad * costoPromedioActual;
      salida = {
        cantidad: mov.cantidad,
        precioUnitario: costoPromedioActual,
        valor,
      };
      totalSalidas += valor;

      // Usar snapshot si existe para el estado resultante
      if (tieneSnapshotOrigen) {
        existenciaAcumulada = mov.stockResultanteOrigen!;
        // El costo promedio NO cambia con salidas, pero tomamos el valor guardado
        costoPromedioActual = mov.costoPromedioResultanteOrigen!;
      } else {
        existenciaAcumulada -= mov.cantidad;
        // El costo promedio no cambia con salidas
      }
    }

    // Generar detalle del movimiento
    let detalle = mov.observacion ?? "";
    if (!detalle) {
      const subTipoLabel: Record<string, string> = {
        compra: "Compra",
        venta: "Venta",
        devolucion_venta: "Devolución de cliente",
        devolucion_compra: "Devolución a proveedor",
      };
      detalle = mov.subTipo ? subTipoLabel[mov.subTipo] ?? mov.tipo : mov.tipo;
    }

    kardexRows.push({
      fecha: mov.fecha,
      detalle,
      numeroDocumento: null, // TODO: Agregar número de documento cuando exista
      entrada,
      salida,
      existencia: {
        cantidad: existenciaAcumulada,
        costoPromedio: costoPromedioActual,
        valor: existenciaAcumulada * costoPromedioActual,
      },
      movimientoId: mov.movimientoId,
    });
  }

  // Resumen
  const resumen: KardexResumen = {
    totalEntradas,
    totalSalidas,
    existenciaFinal: existenciaAcumulada,
    valorFinal: existenciaAcumulada * costoPromedioActual,
    costoPromedioActual,
  };

  const pagination: Pagination = {
    page,
    pageSize,
    total,
    totalPages,
  };

  return {
    data: kardexRows,
    pagination,
    item: itemInfo,
    resumen,
  };
};

/**
 * Obtiene el historial de auditoría de cambios de costo promedio
 */
export const getAuditoriaData = async (query: AuditoriaQuery): Promise<AuditoriaResponse> => {
  const { itemId, bodegaId, page = 1, pageSize = 20 } = query;

  // Obtener los itemBodega IDs para este item
  const itemBodegaConditions = [eq(itemBodegas.itemId, itemId)];
  if (bodegaId) {
    itemBodegaConditions.push(eq(itemBodegas.bodegaId, bodegaId));
  }

  const itemBodegaRecords = await db
    .select({ id: itemBodegas.id })
    .from(itemBodegas)
    .where(and(...itemBodegaConditions));

  const itemBodegaIds = itemBodegaRecords.map((r) => r.id);

  if (itemBodegaIds.length === 0) {
    return {
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
    };
  }

  // Contar total
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditoriaCostoPromedio)
    .where(
      sql`${auditoriaCostoPromedio.itemBodegaId} IN ${itemBodegaIds}`,
    );

  const total = Number(count);
  const totalPages = Math.ceil(total / pageSize);

  // Obtener registros de auditoría
  const rawData = await db
    .select({
      id: auditoriaCostoPromedio.id,
      fecha: auditoriaCostoPromedio.fecha,
      usuarioId: auditoriaCostoPromedio.usuarioId,
      movimientoId: auditoriaCostoPromedio.movimientoId,
      costoAnterior: auditoriaCostoPromedio.costoAnterior,
      costoNuevo: auditoriaCostoPromedio.costoNuevo,
      cantidadAnterior: auditoriaCostoPromedio.cantidadAnterior,
      cantidadNueva: auditoriaCostoPromedio.cantidadNueva,
    })
    .from(auditoriaCostoPromedio)
    .where(
      sql`${auditoriaCostoPromedio.itemBodegaId} IN ${itemBodegaIds}`,
    )
    .orderBy(desc(auditoriaCostoPromedio.fecha))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Enriquecer con nombres de usuario
  const auditoriaRows: AuditoriaRow[] = await Promise.all(
    rawData.map(async (row) => {
      const [usuario] = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, row.usuarioId))
        .limit(1);

      return {
        id: row.id,
        fecha: row.fecha,
        usuario: usuario?.name ?? "Usuario desconocido",
        movimientoId: row.movimientoId,
        costoAnterior: row.costoAnterior,
        costoNuevo: row.costoNuevo,
        cantidadAnterior: row.cantidadAnterior,
        cantidadNueva: row.cantidadNueva,
        diferenciaCosto: row.costoNuevo - row.costoAnterior,
      };
    }),
  );

  return {
    data: auditoriaRows,
    pagination: { page, pageSize, total, totalPages },
  };
};

/**
 * Genera los datos para exportación CSV del Kárdex
 */
export const getKardexCsvData = async (
  query: Omit<KardexQuery, "page" | "pageSize">,
): Promise<{ headers: string[]; rows: string[][] }> => {
  // Obtener todos los datos sin paginación
  const fullQuery: KardexQuery = { ...query, page: 1, pageSize: 10000 };
  const kardexData = await getKardexData(fullQuery);

  const headers = [
    "Fecha",
    "Detalle",
    "N° Doc",
    "Entrada Cant",
    "Entrada P.U.",
    "Entrada Valor",
    "Salida Cant",
    "Salida P.U.",
    "Salida Valor",
    "Exist. Cant",
    "Exist. P.U.",
    "Exist. Valor",
  ];

  const rows = kardexData.data.map((row) => [
    row.fecha.toISOString().split("T")[0],
    row.detalle,
    row.numeroDocumento ?? "",
    row.entrada?.cantidad.toFixed(4) ?? "",
    row.entrada?.precioUnitario.toFixed(4) ?? "",
    row.entrada?.valor.toFixed(4) ?? "",
    row.salida?.cantidad.toFixed(4) ?? "",
    row.salida?.precioUnitario.toFixed(4) ?? "",
    row.salida?.valor.toFixed(4) ?? "",
    row.existencia.cantidad.toFixed(4),
    row.existencia.costoPromedio.toFixed(4),
    row.existencia.valor.toFixed(4),
  ]);

  return { headers, rows };
};
