# Data Model - Gestion de bodegas

## Entities

### Bodega

**Description**: Espacio de almacenamiento con informacion basica y estado operativo.

**Fields**:
- id: Identificador unico.
- identificacion: Codigo unico de bodega.
- nombre: Nombre de bodega (unico por negocio).
- ubicacion: Texto descriptivo opcional.
- estado: Estado operativo (activo/inactivo).
- creadoEn: Fecha de creacion.
- actualizadoEn: Fecha de ultima actualizacion.

**Validation Rules**:
- identificacion y nombre son obligatorios.
- identificacion debe ser unica.
- estado solo permite valores definidos (activo/inactivo).

### Item

**Description**: Producto o item del catalogo disponible para asignacion.

**Fields**:
- id: Identificador unico.
- nombre: Nombre del item.
- estado: Activo/inactivo.

**Validation Rules**:
- items inactivos no se pueden asignar.

### ItemBodega (Asignacion)

**Description**: Relacion entre item y bodega, con datos de control por bodega.

**Fields**:
- id: Identificador unico.
- itemId: Referencia a Item.
- bodegaId: Referencia a Bodega.
- stockMinimo: Opcional.
- stockMaximo: Opcional.
- stockActual: Valor inicial 0 (no se gestiona en esta funcion).
- costoPromedio: Valor inicial 0 (no se gestiona en esta funcion).

**Validation Rules**:
- La combinacion itemId + bodegaId debe ser unica.
- Solo se permite asignar items activos.

## Relationships

- Bodega 1..N ItemBodega
- Item 1..N ItemBodega

## State Transitions

- Bodega: activo <-> inactivo (solo usuarios con permiso de administracion).
