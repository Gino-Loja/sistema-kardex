import { describe, expect, it, vi } from "vitest";

type MovimientoDetalle = {
  itemId: string;
  cantidad: number;
  costoUnitario?: number;
};

type Movimiento = {
  id: string;
  tipo: "entrada" | "salida" | "transferencia" | "ajuste";
  estado: "borrador" | "publicado" | "anulado";
  fecha: Date;
  bodegaOrigenId?: string | null;
  bodegaDestinoId?: string | null;
  usuarioId: string;
  detalles: MovimientoDetalle[];
};

type ItemBodega = {
  id: string;
  itemId: string;
  bodegaId: string;
  stockActual: number;
  costoPromedio: number;
};

describe("movimientos - publicar", () => {
  it("publica una entrada y actualiza stock/costo promedio", async () => {
    const movimientos = new Map<string, Movimiento>();
    const itemBodegas = new Map<string, ItemBodega>();

    movimientos.set("mov-1", {
      id: "mov-1",
      tipo: "entrada",
      estado: "borrador",
      fecha: new Date("2026-01-01T10:00:00Z"),
      bodegaDestinoId: "bod-1",
      usuarioId: "user-1",
      detalles: [
        { itemId: "item-1", cantidad: 5, costoUnitario: 7 },
      ],
    });

    itemBodegas.set("item-1|bod-1", {
      id: "ib-1",
      itemId: "item-1",
      bodegaId: "bod-1",
      stockActual: 10,
      costoPromedio: 5,
    });

    const movimientosRepository = {
      obtenerPorId: vi.fn(async (id: string) => movimientos.get(id) ?? null),
      actualizarEstado: vi.fn(async (id: string, estado: Movimiento["estado"]) => {
        const actual = movimientos.get(id);
        if (!actual) {
          throw new Error("NOT_FOUND");
        }
        const actualizado = { ...actual, estado };
        movimientos.set(id, actualizado);
        return actualizado;
      }),
    };

    const itemBodegaRepository = {
      obtenerPorItemBodega: vi.fn(
        async (itemId: string, bodegaId: string) =>
          itemBodegas.get(`${itemId}|${bodegaId}`) ?? null,
      ),
      guardar: vi.fn(async (registro: ItemBodega) => {
        itemBodegas.set(`${registro.itemId}|${registro.bodegaId}`, registro);
        return registro;
      }),
    };

    const auditLogService = {
      registrarEvento: vi.fn(async () => ({
        id: "audit-1",
        entidad: "movimiento",
        entidadId: "mov-1",
        accion: "publicar",
        usuarioId: "user-1",
        fecha: new Date("2026-01-01T10:00:00Z"),
      })),
    };

    const { createMovementsService } = (await import(
      "../../src/lib/dal/services/" + "movements.service"
    )) as {
      createMovementsService: (deps: unknown) => {
        publicarMovimiento: (input: {
          movimientoId: string;
          usuarioId: string;
        }) => Promise<Movimiento>;
      };
    };

    const service = createMovementsService({
      movimientosRepository,
      itemBodegaRepository,
      auditLogService,
    });

    const actualizado = await service.publicarMovimiento({
      movimientoId: "mov-1",
      usuarioId: "user-1",
    });

    expect(actualizado.estado).toBe("publicado");

    const itemBodegaActualizado = itemBodegas.get("item-1|bod-1");
    expect(itemBodegaActualizado?.stockActual).toBe(15);
    expect(itemBodegaActualizado?.costoPromedio).toBeCloseTo(85 / 15, 6);
    expect(auditLogService.registrarEvento).toHaveBeenCalledTimes(1);
  });
});
