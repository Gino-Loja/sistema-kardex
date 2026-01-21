-- Migration: Add sub_tipo column to movimientos
-- Feature: 003-weighted-average-costing

ALTER TABLE movimientos
ADD COLUMN sub_tipo TEXT;

-- Create index for tipo column (for filtering)
CREATE INDEX IF NOT EXISTS movimientos_tipo_idx ON movimientos(tipo);

-- Backfill existing published movements with default sub_tipo
UPDATE movimientos
SET sub_tipo = CASE
  WHEN tipo = 'entrada' THEN 'compra'
  WHEN tipo = 'salida' THEN 'venta'
  ELSE NULL
END
WHERE sub_tipo IS NULL AND estado = 'publicado';
