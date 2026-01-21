# Research: Asignacion de items a bodega

## Decision 1: Modal con buscador y seleccion multiple
**Decision**: Usar un modal para buscar y seleccionar uno o varios items antes de asignarlos a la bodega.
**Rationale**: Reduce la friccion y evita abandonar la pantalla principal de la bodega.
**Alternatives considered**: Navegacion a una pagina separada de seleccion; asignacion uno a uno sin buscador.

## Decision 2: Paginacion fija de 20 items
**Decision**: La tabla de items asignados muestra 20 items por pagina con controles de navegacion.
**Rationale**: Requisito explicito del feature y mejora rendimiento percibido.
**Alternatives considered**: Scroll infinito; tamanos de pagina configurables.

## Decision 3: Edicion inline con guardado explicito
**Decision**: Edicion en la tabla de stock minimo, stock actual, stock maximo y costo promedio con boton de guardar cuando hay cambios pendientes.
**Rationale**: Evita guardados accidentales y clarifica el estado de cambios.
**Alternatives considered**: Guardado automatico por campo; formulario separado.

## Decision 4: Busqueda de items basada en el indice existente
**Decision**: La busqueda del modal usa los campos ya indexados/consultables del catalogo de items actual sin introducir nuevos criterios.
**Rationale**: Mantiene consistencia con el comportamiento actual y reduce cambios de datos.
**Alternatives considered**: Agregar nuevos campos de busqueda o filtros avanzados en esta fase.

## Decision 5: Validaciones de stock
**Decision**: Validar que los valores de stock y costo sean no negativos y que stock maximo >= stock minimo.
**Rationale**: Evita estados inconsistentes y alinea con reglas de inventario basicas.
**Alternatives considered**: Permitir valores negativos para ajustes; validar solo en backend.
