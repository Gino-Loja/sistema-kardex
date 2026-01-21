-- Agregar campos para guardar el saldo inicial histórico en item_bodegas
ALTER TABLE "item_bodegas" ADD COLUMN IF NOT EXISTS "stock_inicial" numeric(14, 4);
ALTER TABLE "item_bodegas" ADD COLUMN IF NOT EXISTS "costo_inicial" numeric(14, 4);
