-- Agregar campos de snapshot para historial del Kardex
-- Campos para bodega DESTINO (entradas, transferencias)
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "stock_resultante" numeric(14, 4);
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "costo_promedio_resultante" numeric(14, 4);
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "valor_total_resultante" numeric(14, 4);

-- Campos para bodega ORIGEN (salidas, transferencias)
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "stock_resultante_origen" numeric(14, 4);
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "costo_promedio_resultante_origen" numeric(14, 4);
ALTER TABLE "detalle_movimientos" ADD COLUMN IF NOT EXISTS "valor_total_resultante_origen" numeric(14, 4);

-- Campos para guardar el saldo inicial histórico en item_bodegas
ALTER TABLE "item_bodegas" ADD COLUMN IF NOT EXISTS "stock_inicial" numeric(14, 4);
ALTER TABLE "item_bodegas" ADD COLUMN IF NOT EXISTS "costo_inicial" numeric(14, 4);
