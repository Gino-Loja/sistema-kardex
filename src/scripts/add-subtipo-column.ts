import { db } from "../lib/drizzle/db";
import { sql } from "drizzle-orm";

async function addSubTipoColumn() {
  try {
    // Add sub_tipo column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE movimientos
      ADD COLUMN IF NOT EXISTS sub_tipo TEXT
    `);
    console.log("Added sub_tipo column");

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS movimientos_tipo_idx ON movimientos(tipo)
    `);
    console.log("Created index");

    // Backfill existing movements
    const result = await db.execute(sql`
      UPDATE movimientos
      SET sub_tipo = CASE
        WHEN tipo = 'entrada' THEN 'compra'
        WHEN tipo = 'salida' THEN 'venta'
        ELSE NULL
      END
      WHERE sub_tipo IS NULL AND estado = 'publicado'
    `);
    console.log("Backfilled sub_tipo values");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addSubTipoColumn();
