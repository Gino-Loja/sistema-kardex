# Data Model

No changes to the existing data model are anticipated. The feature will rely on the existing `items` and `item_bodegas` schemas.

## `items` Schema

| Field | Type | Description |
|---|---|---|
| `id` | `text` | Primary key |
| `codigo` | `text` | Item code |
| `nombre` | `text` | Item name |
| `descripcion` | `text` | Item description |
| `unidadMedida` | `text` | Unit of measure |
| `categoriaId` | `text` | Foreign key to `categorias` table |
| `costoPromedio` | `numeric` | Average cost of the item |
| `estado` | `text` | Item status (e.g., "activo") |
| `imagenUrl` | `text` | URL of the item image |
| `creadoEn` | `timestamp` | Timestamp of creation |
| `actualizadoEn` | `timestamp` | Timestamp of last update |

## `item_bodegas` Schema

| Field | Type | Description |
|---|---|---|
| `id` | `text` | Primary key |
| `itemId` | `text` | Foreign key to `items` table |
| `bodegaId` | `text` | Foreign key to `bodegas` table |
| `stockMinimo` | `numeric` | Minimum stock level |
| `stockMaximo` | `numeric` | Maximum stock level |
| `stockActual` | `numeric` | Current stock level |
| `costoPromedio` | `numeric` | Average cost of the item in the specific bodega |
