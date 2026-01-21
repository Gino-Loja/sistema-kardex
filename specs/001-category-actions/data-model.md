# Data Model: Category actions (edit/delete)

## Entity: Categoria

**Purpose**: Catalog to classify items; editable and removable with defined delete impact.

**Fields**:
- id (unique identifier)
- nombre (string, required, non-empty)
- estado (active | inactive)
- createdAt
- updatedAt

**Validation Rules**:
- nombre is required and must be unique within the catalog.
- estado defaults to active.

**Relationships**:
- Categoria 1..* -> Item (items may reference it)

## Entity: Item

**Purpose**: Inventory record that may reference a category.

**Fields**:
- id (unique identifier)
- nombre (string, required)
- categoriaId (nullable reference to Categoria)
- createdAt
- updatedAt

**Validation Rules**:
- categoriaId may be null; if present, must reference an existing Categoria.

**Relationships**:
- Item 0..1 -> Categoria (optional)

## Lifecycle / State Transitions

- Categoria: active -> inactive
- Categoria: inactive -> active
- Categoria: delete -> items referencing it have categoriaId cleared

## Integrity Rules

- Deleting a category does not delete items.
- Items remain valid without a category.
