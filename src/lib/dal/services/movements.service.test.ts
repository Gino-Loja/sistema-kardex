import { describe, it, expect, vi } from "vitest";
import { createMovementsService } from "./movements.service";
import type {
  MovimientosRepository,
  ItemBodegaRepository,
  ItemsRepository,
  BodegasRepository,
} from "./movements.service";
import type { AuditLogService } from "./audit-log.service";

describe("Movements Service", () => {
  it("should recalculate average cost when auto-update is enabled", async () => {
    const mockMovimientosRepo: MovimientosRepository = {
      obtenerPorId: vi.fn().mockResolvedValue({
        id: "mov1",
        tipo: "entrada",
        subTipo: "compra",
        estado: "borrador",
        bodegaDestinoId: "bod1",
        detalles: [{ itemId: "item1", cantidad: 10, costoUnitario: 120 }],
      }),
      actualizarEstado: vi.fn(),
      actualizarSnapshotDetalle: vi.fn(),
    };

    const mockItemBodegaRepo: ItemBodegaRepository = {
      obtenerPorItemBodega: vi.fn().mockResolvedValue({
        id: "ib1",
        itemId: "item1",
        bodegaId: "bod1",
        stockActual: 10,
        costoPromedio: 100,
      }),
      guardar: vi.fn().mockImplementation((item) => Promise.resolve(item)),
      actualizarCostoPromedioParaItem: vi.fn(),
    };

    const mockItemsRepo: ItemsRepository = {
      actualizarCostoPromedio: vi.fn(),
    };

    const mockBodegasRepo: BodegasRepository = {
      obtenerPorId: vi
        .fn()
        .mockResolvedValue({ auto_update_average_cost: true }),
    };

    const mockAuditLogService: AuditLogService = {
      registrarEvento: vi.fn(),
    };

    const service = createMovementsService({
      movimientosRepository: mockMovimientosRepo,
      itemBodegaRepository: mockItemBodegaRepo,
      itemsRepository: mockItemsRepo,
      bodegasRepository: mockBodegasRepo,
      auditLogService: mockAuditLogService,
    });

    await service.publicarMovimiento({
      movimientoId: "mov1",
      usuarioId: "user1",
    });

    // Expect recalculation to have happened
    expect(mockItemBodegaRepo.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        costoPromedio: 110, // (10 * 100 + 10 * 120) / (10 + 10) = 110
      }),
    );
    expect(
      mockItemBodegaRepo.actualizarCostoPromedioParaItem,
    ).toHaveBeenCalled();
  });

  it("should NOT recalculate average cost when auto-update is disabled", async () => {
    const mockMovimientosRepo: MovimientosRepository = {
        obtenerPorId: vi.fn().mockResolvedValue({
          id: "mov1",
          tipo: "entrada",
          subTipo: "compra",
          estado: "borrador",
          bodegaDestinoId: "bod1",
          detalles: [{ itemId: "item1", cantidad: 10, costoUnitario: 120 }],
        }),
        actualizarEstado: vi.fn(),
        actualizarSnapshotDetalle: vi.fn(),
      };
  
      const mockItemBodegaRepo: ItemBodegaRepository = {
        obtenerPorItemBodega: vi.fn().mockResolvedValue({
          id: "ib1",
          itemId: "item1",
          bodegaId: "bod1",
          stockActual: 10,
          costoPromedio: 100,
        }),
        guardar: vi.fn().mockImplementation((item) => Promise.resolve(item)),
        actualizarCostoPromedioParaItem: vi.fn(),
      };
  
      const mockItemsRepo: ItemsRepository = {
        actualizarCostoPromedio: vi.fn(),
      };
  
      const mockBodegasRepo: BodegasRepository = {
        obtenerPorId: vi
          .fn()
          .mockResolvedValue({ auto_update_average_cost: false }),
      };
  
      const mockAuditLogService: AuditLogService = {
        registrarEvento: vi.fn(),
      };
  
      const service = createMovementsService({
        movimientosRepository: mockMovimientosRepo,
        itemBodegaRepository: mockItemBodegaRepo,
        itemsRepository: mockItemsRepo,
        bodegasRepository: mockBodegasRepo,
        auditLogService: mockAuditLogService,
      });
  
      await service.publicarMovimiento({
        movimientoId: "mov1",
        usuarioId: "user1",
      });
  
      // Expect recalculation to NOT have happened
      expect(mockItemBodegaRepo.guardar).toHaveBeenCalledWith(
        expect.objectContaining({
          costoPromedio: 100, // Stays the same
        }),
      );
      expect(
        mockItemBodegaRepo.actualizarCostoPromedioParaItem,
      ).not.toHaveBeenCalled();
  });
});
