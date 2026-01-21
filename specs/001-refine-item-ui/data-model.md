# Data Model: Refine Item UI

## Entity: Item

**Description**: Producto del inventario que se muestra en la tabla y en el detalle.

**Fields**:
- id (identificador unico)
- codigo (si aplica)
- nombre
- categoria
- unidadDeMedida
- stockActual o disponibilidad
- costo
- precioVenta
- fechaUltimaActualizacion
- imagenPrincipalUrl (referencia a la imagen principal)

**Relationships**:
- Item pertenece a una Categoria.
- Item puede tener una Imagen principal asociada.

## Entity: ImagenItem

**Description**: Imagen principal usada para identificar visualmente un item.

**Fields**:
- id
- itemId
- url
- altText
- esPrincipal

**Relationships**:
- ImagenItem pertenece a un Item.
