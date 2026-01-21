-- Migration: Create auditoria_costo_promedio table
-- Feature: 003-weighted-average-costing

CREATE TABLE auditoria_costo_promedio (
  id TEXT PRIMARY KEY,
  item_bodega_id TEXT NOT NULL REFERENCES item_bodegas(id) ON DELETE CASCADE,
  movimiento_id TEXT NOT NULL REFERENCES movimientos(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  costo_anterior NUMERIC(14,4) NOT NULL,
  costo_nuevo NUMERIC(14,4) NOT NULL,
  cantidad_anterior NUMERIC(14,4) NOT NULL,
  cantidad_nueva NUMERIC(14,4) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX auditoria_costo_item_bodega_idx ON auditoria_costo_promedio(item_bodega_id);
CREATE INDEX auditoria_costo_movimiento_idx ON auditoria_costo_promedio(movimiento_id);
CREATE INDEX auditoria_costo_fecha_idx ON auditoria_costo_promedio(fecha);
