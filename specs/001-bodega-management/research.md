# Research - Gestion de bodegas

## Decision 1: Modelo de datos base

**Decision**: Reutilizar las entidades existentes `bodegas` y `item_bodegas` como base de la gestion y asignacion.
**Rationale**: Ya existen tablas con campos clave (identificacion, nombre, estado) y una relacion item-bodega con indices de unicidad.
**Alternatives considered**: Crear una nueva tabla de asignaciones separada para esta funcion; se descarto por duplicar datos y reglas.

## Decision 2: Alcance de asignacion

**Decision**: La asignacion de items a bodega registra la relacion sin generar movimientos de inventario ni actualizar cantidades en este alcance.
**Rationale**: El alcance aprobado excluye movimientos y gestion de cantidades; evita afectar el ledger contable.
**Alternatives considered**: Actualizar stock o generar movimientos al asignar; se descarto por ampliar el alcance contable.

## Decision 3: Permisos por rol

**Decision**: Admin puede crear y editar bodegas; Admin y Bodeguero pueden ver detalles y asignar items.
**Rationale**: El Bodeguero necesita organizar inventario por ubicacion, mientras que la administracion de bodegas queda restringida.
**Alternatives considered**: Solo Admin para todas las acciones; se descarto por limitar operacion diaria.
