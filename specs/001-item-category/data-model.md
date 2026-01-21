# Data Model: Item nombre y categoria opcional

## Entity: Item

**Purpose**: Inventory record with required name and optional category.

**Fields**:
- id (unique identifier)
- nombre (string, required, non-empty)
- categoriaId (optional reference to Categoria)
- createdAt
- updatedAt

**Validation Rules**:
- nombre is required and cannot be empty or whitespace.
- categoriaId may be null; if present, must reference an existing Categoria.

**Relationships**:
- Item 0..1 -> Categoria (optional, single category per item)

## Entity: Categoria

**Purpose**: Catalog to classify items globally.

**Fields**:
- id (unique identifier)
- nombre (string, required, unique within catalog)
- estado (active | inactive)
- createdAt
- updatedAt

**Validation Rules**:
- nombre is required and must be unique within the catalog.
- estado defaults to active; inactive categories remain selectable only if explicitly allowed (default: not selectable for new items).

**Relationships**:
- Categoria 1..* -> Item (items may reference it)

## Lifecycle / State Transitions

- Categoria: active -> inactive (manual deactivation)
- Categoria: inactive -> active (reactivation)
- Categoria: delete -> items referencing it have categoriaId cleared

## Integrity Rules

- Removing or deactivating a category must not delete items.
- Item records remain valid without a category.
