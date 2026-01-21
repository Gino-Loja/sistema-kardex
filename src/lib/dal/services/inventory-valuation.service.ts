export type EstadoInventario = {
  stockActual: number;
  costoPromedio: number;
};

export type EntradaInventario = {
  cantidad: number;
  costoUnitario: number;
};

export type SalidaInventario = {
  cantidad: number;
  permitirNegativo?: boolean;
};

export const calcularSaldoValorizado = (estado: EstadoInventario): number =>
  estado.stockActual * estado.costoPromedio;

export const calcularCostoPromedioPonderado = (
  estado: EstadoInventario,
  entrada: EntradaInventario,
): EstadoInventario => {
  if (entrada.cantidad <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  if (entrada.costoUnitario < 0) {
    throw new Error("INVALID_COST");
  }

  const nuevoStock = estado.stockActual + entrada.cantidad;

  if (nuevoStock === 0) {
    return {
      stockActual: 0,
      costoPromedio: 0,
    };
  }

  const costoAcumulado =
    estado.stockActual * estado.costoPromedio +
    entrada.cantidad * entrada.costoUnitario;

  return {
    stockActual: nuevoStock,
    costoPromedio: costoAcumulado / nuevoStock,
  };
};

export const aplicarSalidaInventario = (
  estado: EstadoInventario,
  salida: SalidaInventario,
): EstadoInventario & { costoSalida: number } => {
  if (salida.cantidad <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const nuevoStock = estado.stockActual - salida.cantidad;

  if (nuevoStock < 0 && !salida.permitirNegativo) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  return {
    stockActual: nuevoStock,
    costoPromedio: estado.costoPromedio,
    costoSalida: salida.cantidad * estado.costoPromedio,
  };
};
