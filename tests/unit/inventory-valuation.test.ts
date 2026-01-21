import { describe, expect, it } from "vitest";
import {
  aplicarSalidaInventario,
  calcularCostoPromedioPonderado,
} from "../../src/lib/dal/services/inventory-valuation.service";

describe("inventario - costo promedio ponderado", () => {
  it("calcula el costo promedio con entradas sucesivas", () => {
    const estadoInicial = { stockActual: 10, costoPromedio: 5 };
    const entrada = { cantidad: 5, costoUnitario: 7 };

    const resultado = calcularCostoPromedioPonderado(estadoInicial, entrada);

    expect(resultado.stockActual).toBe(15);
    expect(resultado.costoPromedio).toBeCloseTo(85 / 15, 6);
  });

  it("mantiene el costo promedio al aplicar una salida", () => {
    const estadoInicial = { stockActual: 12, costoPromedio: 8 };
    const salida = { cantidad: 3 };

    const resultado = aplicarSalidaInventario(estadoInicial, salida);

    expect(resultado.stockActual).toBe(9);
    expect(resultado.costoPromedio).toBe(8);
    expect(resultado.costoSalida).toBe(24);
  });
});
