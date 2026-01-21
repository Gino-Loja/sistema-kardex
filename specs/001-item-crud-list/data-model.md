# Data Model: Item CRUD and Listing

## Entities

### Item
- id (text, primary key)
- codigo (text, unique)
- descripcion (text)
- unidad_medida (text)
- categoria (text, optional)
- costo_promedio (numeric)
- estado (text, default activo)
- imagen_url (text, optional)
- creado_en (timestamp)
- actualizado_en (timestamp)

Validation rules
- codigo is required and unique.
- descripcion and unidad_medida are required.
- estado must be one of the existing item status values.
- imagen_url is optional and points to the MinIO object URL.

### ItemImage (logical)
- item_id (references Item)
- object_key (text)
- url (text)
- content_type (text)
- size_bytes (number)

Validation rules
- Content type must be JPEG, PNG, or WebP.
- size_bytes must be <= 5 MB.
- One image per item (optional).

### ItemBodega (existing relationship)
- id (text, primary key)
- item_id (text, required)
- bodega_id (text, required)
- stock_minimo (numeric, optional)
- stock_maximo (numeric, optional)
- stock_actual (numeric, default 0)
- costo_promedio (numeric, default 0)

Relationships
- Item 1..0/1 ItemImage
- Item 1..N ItemBodega
- Bodega 1..N ItemBodega

State and lifecycle notes
- Item can be created without a bodega association.
- Image is replaced on edit and deleted when the item is deleted.
