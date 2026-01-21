# Quickstart

This document explains how to test the "Movimiento con Precio de Referencia" feature.

## Prerequisites

- The application must be running (`npm run dev`).
- You must have at least one `bodega` (e.g., "BO-01").
- You must have at least one `item` (e.g., "Llantas") with a `costoPromedio` of 0 in the `items` table.
- The item must be assigned to the `bodega` in the `item_bodegas` table with a `costoPromedio` of 50.

## Steps to Verify

1.  Navigate to the "Movimientos" page and click "Crear Movimiento".
2.  Select "Salida" as the "Tipo de Movimiento".
3.  Select "BO-01" as the "Bodega Origen".
4.  In a detail line, select "Llantas" as the item.
5.  **Verify:** The "Costo Unit." field for "Llantas" should display "50".
6.  **Verify:** The "Sin precio de referencia" warning should **not** be displayed.
7.  **Verify:** The cost should be displayed within 500ms.
8.  In the same detail line, change the item to another item with a different `costoPromedio`.
9.  **Verify:** The "Costo Unit." field should update to the new item's `costoPromedio`.
