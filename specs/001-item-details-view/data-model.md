# Data Model: Vista de detalles de item

## Entity: Item

**Purpose**: Representa un producto del inventario con sus datos principales y estado.

### Fields

- **id**: Identificador unico del item.
- **nombre**: Nombre del item.
- **codigo**: Codigo del item.
- **categoria**: Categoria asignada al item.
- **unidad**: Unidad de medida del item.
- **estado**: Estado del item (activo/inactivo u otro estado existente).

### Relationships

- **Item -> Categoria**: Un item pertenece a una categoria (si aplica en el modelo actual).

### Validation Rules

- `nombre`, `codigo`, `categoria`, `unidad`, `estado` son campos obligatorios para la vista de detalles.
- `id` debe referenciar un item existente.

### State Transitions

- Sin cambios de estado nuevos para esta funcionalidad.
