"use client";

import type { KardexRow, KardexResumen, ItemInfo } from "@/lib/types/kardex";
import { formatCurrency, formatNumber } from "@/lib/utils";

type KardexTableProps = {
  rows: KardexRow[];
  resumen: KardexResumen;
  item: ItemInfo;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export function KardexTable({ rows, resumen, item }: KardexTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Item info header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 text-sm md:grid-cols-4">
          <div>
            <span className="text-xs text-neutral-500">Codigo</span>
            <p className="font-semibold text-neutral-900">{item.codigo}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Nombre</span>
            <p className="font-medium text-neutral-700">{item.nombre}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Unidad</span>
            <p className="text-neutral-700">{item.unidadMedida}</p>
          </div>
          {item.categoria && (
            <div>
              <span className="text-xs text-neutral-500">Categoria</span>
              <p className="text-neutral-700">{item.categoria}</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <span className="text-xs text-neutral-500">Total Entradas</span>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(resumen.totalEntradas)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <span className="text-xs text-neutral-500">Total Salidas</span>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(resumen.totalSalidas)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <span className="text-xs text-neutral-500">Existencia Final</span>
          <p className="text-lg font-semibold text-neutral-900">
            {formatNumber(resumen.existenciaFinal, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <span className="text-xs text-neutral-500">Costo Promedio</span>
          <p className="text-lg font-semibold text-neutral-900">
            {formatCurrency(resumen.costoPromedioActual)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <span className="text-xs text-neutral-500">Valor Total</span>
          <p className="text-lg font-semibold text-blue-600">
            {formatCurrency(resumen.valorFinal)}
          </p>
        </div>
      </div>

      {/* Table - 12 column kardex format */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Mobile view */}
        <div className="md:hidden">
          <div className="divide-y divide-neutral-100">
            {rows.map((row, index) => (
              <div
                key={`${row.movimientoId}-${index}`}
                className="flex flex-col gap-2 px-4 py-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    {formatDate(row.fecha)}
                  </span>
                  <span className="text-xs font-medium text-neutral-700">
                    {row.detalle}
                  </span>
                </div>
                {row.entrada && (
                  <div className="rounded-lg bg-green-50 p-2">
                    <span className="text-xs font-medium text-green-700">
                      Entrada
                    </span>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-green-600">Cant:</span>{" "}
                        {formatNumber(row.entrada.cantidad, 0)}
                      </div>
                      <div>
                        <span className="text-green-600">P.U.:</span>{" "}
                        {formatCurrency(row.entrada.precioUnitario)}
                      </div>
                      <div>
                        <span className="text-green-600">Valor:</span>{" "}
                        {formatCurrency(row.entrada.valor)}
                      </div>
                    </div>
                  </div>
                )}
                {row.salida && (
                  <div className="rounded-lg bg-red-50 p-2">
                    <span className="text-xs font-medium text-red-700">
                      Salida
                    </span>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-red-600">Cant:</span>{" "}
                        {formatNumber(row.salida.cantidad, 0)}
                      </div>
                      <div>
                        <span className="text-red-600">P.U.:</span>{" "}
                        {formatCurrency(row.salida.precioUnitario)}
                      </div>
                      <div>
                        <span className="text-red-600">Valor:</span>{" "}
                        {formatCurrency(row.salida.valor)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="rounded-lg bg-neutral-50 p-2">
                  <span className="text-xs font-medium text-neutral-700">
                    Existencia
                  </span>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Cant:</span>{" "}
                      {formatNumber(row.existencia.cantidad, 0)}
                    </div>
                    <div>
                      <span className="text-neutral-500">Costo:</span>{" "}
                      {formatCurrency(row.existencia.costoPromedio)}
                    </div>
                    <div>
                      <span className="text-neutral-500">Valor:</span>{" "}
                      {formatCurrency(row.existencia.valor)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop view - full 12 column table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-max">
            {/* Header with grouped columns */}
            <div className="border-b border-neutral-200 bg-neutral-50">
              {/* Top header - group labels */}
              <div className="grid grid-cols-[120px_180px_100px_repeat(3,100px)_repeat(3,100px)_repeat(3,100px)] border-b border-neutral-100 text-center text-[10px] font-semibold text-neutral-600">
                <span className="px-2 py-2"></span>
                <span className="px-2 py-2"></span>
                <span className="px-2 py-2"></span>
                <span className="col-span-3 border-l border-neutral-200 bg-green-50 px-2 py-2 text-green-700">
                  ENTRADAS
                </span>
                <span className="col-span-3 border-l border-neutral-200 bg-red-50 px-2 py-2 text-red-700">
                  SALIDAS
                </span>
                <span className="col-span-3 border-l border-neutral-200 bg-blue-50 px-2 py-2 text-blue-700">
                  EXISTENCIAS
                </span>
              </div>
              {/* Sub header - column labels */}
              <div className="grid grid-cols-[120px_180px_100px_repeat(3,100px)_repeat(3,100px)_repeat(3,100px)] gap-1 px-2 py-2 text-[10px] font-semibold text-neutral-500">
                <span>Fecha</span>
                <span>Detalle</span>
                <span>N. Doc</span>
                <span className="border-l border-neutral-200 text-green-600">
                  Cantidad
                </span>
                <span className="text-green-600">P. Unit.</span>
                <span className="text-green-600">Valor</span>
                <span className="border-l border-neutral-200 text-red-600">
                  Cantidad
                </span>
                <span className="text-red-600">P. Unit.</span>
                <span className="text-red-600">Valor</span>
                <span className="border-l border-neutral-200 text-blue-600">
                  Cantidad
                </span>
                <span className="text-blue-600">C. Prom.</span>
                <span className="text-blue-600">Valor</span>
              </div>
            </div>

            {/* Data rows */}
            <div className="divide-y divide-neutral-100">
              {rows.map((row, index) => (
                <div
                  key={`${row.movimientoId}-${index}`}
                  className="grid grid-cols-[120px_180px_100px_repeat(3,100px)_repeat(3,100px)_repeat(3,100px)] gap-1 px-2 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  <span className="font-medium">{formatDate(row.fecha)}</span>
                  <span className="truncate" title={row.detalle}>
                    {row.detalle}
                  </span>
                  <span className="text-neutral-500">
                    {row.numeroDocumento ?? "-"}
                  </span>
                  {/* Entrada columns */}
                  <span className="border-l border-neutral-100 pl-2 text-green-700">
                    {row.entrada ? formatNumber(row.entrada.cantidad, 0) : ""}
                  </span>
                  <span className="text-green-700">
                    {row.entrada
                      ? formatCurrency(row.entrada.precioUnitario)
                      : ""}
                  </span>
                  <span className="font-medium text-green-700">
                    {row.entrada ? formatCurrency(row.entrada.valor) : ""}
                  </span>
                  {/* Salida columns */}
                  <span className="border-l border-neutral-100 pl-2 text-red-700">
                    {row.salida ? formatNumber(row.salida.cantidad, 0) : ""}
                  </span>
                  <span className="text-red-700">
                    {row.salida
                      ? formatCurrency(row.salida.precioUnitario)
                      : ""}
                  </span>
                  <span className="font-medium text-red-700">
                    {row.salida ? formatCurrency(row.salida.valor) : ""}
                  </span>
                  {/* Existencia columns */}
                  <span className="border-l border-neutral-100 pl-2 font-medium">
                    {formatNumber(row.existencia.cantidad, 0)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(row.existencia.costoPromedio)}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(row.existencia.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
