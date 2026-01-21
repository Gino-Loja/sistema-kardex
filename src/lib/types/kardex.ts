/**
 * Kardex types for weighted average costing view
 */

export type KardexMovement = {
  cantidad: number;
  precioUnitario: number;
  valor: number;
} | null;

export type KardexExistencia = {
  cantidad: number;
  costoPromedio: number;
  valor: number;
};

export type KardexRow = {
  fecha: Date;
  detalle: string;
  numeroDocumento: string | null;
  entrada: KardexMovement;
  salida: KardexMovement;
  existencia: KardexExistencia;
  movimientoId: string | null;
};

export type ItemInfo = {
  id: string;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  categoria: string | null;
};

export type KardexResumen = {
  totalEntradas: number;
  totalSalidas: number;
  existenciaFinal: number;
  valorFinal: number;
  costoPromedioActual: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type KardexResponse = {
  data: KardexRow[];
  pagination: Pagination;
  item: ItemInfo;
  resumen: KardexResumen;
};

export type KardexFilters = {
  itemId: string;
  bodegaId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipo?: "entrada" | "salida" | "transferencia";
  page?: number;
  pageSize?: number;
};

export type AuditoriaRow = {
  id: string;
  fecha: Date;
  usuario: string;
  movimientoId: string;
  costoAnterior: number;
  costoNuevo: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferenciaCosto: number;
};

export type AuditoriaResponse = {
  data: AuditoriaRow[];
  pagination: Pagination;
};

export type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

export type MovementSubType = "compra" | "venta" | "devolucion_venta" | "devolucion_compra" | null;
