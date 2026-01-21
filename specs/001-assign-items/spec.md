# Feature Specification: Asignacion de items a bodega

**Feature Branch**: `001-assign-items`  
**Created**: 2026-01-10  
**Status**: Draft  
**Input**: User description: "al momento de Asignar items debe salirme en un modal y poder escoger o buscar los items y seleccionarlos. Ahora en la tabla Items asignados debe tener paginacion deben salir 20 items y poder quitar eliminar los items de la bodega. Que se pueda editar el stock minimo, actual y maximo y el costo promedio en la misma tabla y cuando haga algun cambio me salga un boton para guardar."

## Clarifications

### Session 2026-01-10

- Q: Como debe manejarse la salida de la pagina con cambios sin guardar? → A: Permitir salir con confirmacion de descartar cambios.
- Q: Como debe tratarse la seleccion de items ya asignados en el modal? → A: Ocultar o deshabilitar items ya asignados en el modal.
- Q: Que regla de validacion aplica entre stock minimo y maximo? → A: Solo validar: stockMaximo >= stockMinimo (stockActual puede estar fuera).
- Q: Como debe comportarse la eliminacion de items asignados? → A: Pedir confirmacion antes de eliminar.
- Q: Como debe aplicarse el guardado de cambios en la tabla? → A: Guardar todos los cambios pendientes en una sola accion.
- Q: Como debe limitarse el costo promedio en edicion? → A: Limitar costo promedio a 2 decimales.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Asignar items con buscador (Priority: P1)

Como bodeguero, quiero abrir un modal para buscar y seleccionar items, para asignarlos rapidamente a una bodega sin salir de la pantalla actual.

**Why this priority**: Es el flujo principal para agregar items a la bodega y desbloquea el resto de la gestion.

**Independent Test**: Se puede probar asignando items desde el modal y verificando que aparecen en la tabla de items asignados.

**Acceptance Scenarios**:

1. **Given** la pantalla de bodega abierta, **When** el usuario inicia la accion de asignar items, **Then** se muestra un modal con buscador y lista de items seleccionables.
2. **Given** el modal abierto, **When** el usuario busca y selecciona uno o mas items y confirma, **Then** los items quedan asignados a la bodega y visibles en la tabla.

---

### User Story 2 - Gestionar items asignados (Priority: P2)

Como bodeguero, quiero ver los items asignados con paginacion y poder eliminarlos, para mantener la lista ordenada y actualizada.

**Why this priority**: Permite controlar el inventario asignado y evitar errores por items obsoletos.

**Independent Test**: Se puede probar navegando paginas de la tabla y eliminando un item, verificando que deja de aparecer.

**Acceptance Scenarios**:

1. **Given** mas de 20 items asignados, **When** el usuario navega la tabla, **Then** la tabla muestra 20 items por pagina y permite cambiar de pagina.
2. **Given** un item asignado, **When** el usuario lo elimina, **Then** el item deja de estar asignado y se refleja en la tabla.

---

### User Story 3 - Editar stocks y costo en la tabla (Priority: P3)

Como bodeguero, quiero editar el stock minimo, actual, maximo y el costo promedio directamente en la tabla, y guardar cambios con un boton, para actualizar valores sin pasos extra.

**Why this priority**: Reduce friccion al actualizar datos clave del inventario.

**Independent Test**: Se puede probar editando un valor y confirmando que aparece un boton de guardar y que el cambio persiste al guardar.

**Acceptance Scenarios**:

1. **Given** la tabla de items asignados, **When** el usuario modifica alguno de los valores editables, **Then** aparece un boton para guardar los cambios pendientes.
2. **Given** cambios pendientes, **When** el usuario guarda, **Then** los valores se actualizan y el boton de guardar deja de mostrarse si no hay cambios.

---

### Edge Cases

- Que sucede cuando la busqueda no devuelve resultados en el modal?
- Que sucede cuando se intenta eliminar el ultimo item de una pagina?
- Que sucede si el usuario navega fuera de la pagina con cambios sin guardar y no confirma el descarte?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un modal de asignacion que permita buscar y seleccionar items.
- **FR-002**: El sistema MUST permitir seleccionar uno o varios items en el modal y confirmarlos para asignarlos a la bodega.
- **FR-003**: La tabla de items asignados MUST soportar paginacion con 20 items por pagina.
- **FR-004**: Los usuarios MUST poder eliminar items asignados desde la tabla.
- **FR-005**: Los usuarios MUST poder editar en la tabla los campos stock minimo, stock actual, stock maximo y costo promedio.
- **FR-006**: El sistema MUST mostrar un boton de guardar cuando existan cambios pendientes en la tabla.
- **FR-007**: El sistema MUST guardar los cambios pendientes solo cuando el usuario confirme con el boton de guardar.
- **FR-008**: El sistema MUST reflejar en la tabla las altas, bajas y ediciones una vez confirmadas.
- **FR-009**: El sistema MUST mostrar una confirmacion para descartar cambios cuando el usuario intenta salir con ediciones pendientes.
- **FR-010**: El sistema MUST ocultar o deshabilitar en el modal los items ya asignados a la bodega.
- **FR-011**: El sistema MUST validar que stockMaximo sea mayor o igual a stockMinimo; stockActual puede estar fuera de ese rango.
- **FR-012**: El sistema MUST solicitar confirmacion antes de eliminar un item asignado.
- **FR-013**: El sistema MUST guardar todos los cambios pendientes en una sola accion de guardado.
- **FR-014**: El sistema MUST limitar el costo promedio a 2 decimales al editar.

### Assumptions

- Solo usuarios con permisos de bodega pueden asignar, eliminar o editar items.
- Los cambios no se guardan automaticamente; requieren confirmacion explicita.
- Los valores editados se validan para evitar numeros negativos o inconsistentes.

### Non-Functional Requirements (Constitutional)

- **NFR-SEC-001**: System MUST enforce authentication/authorization on protected
  routes and validate RBAC permissions per operation (Admin, Bodeguero).
- **NFR-SEC-002**: System MUST sanitize inputs and handle file uploads securely.
- **NFR-SEC-003**: System MUST log audit events for critical operations.
- **NFR-DATA-001**: System MUST preserve referential integrity and use transactions
  for critical operations.
- **NFR-DATA-002**: System MUST validate NIC 2 accounting rules and maintain an
  append-only movement ledger.
- **NFR-DATA-003**: System MUST compute weighted average cost automatically.
- **NFR-UX-001**: System MUST provide clear loading/error states and real-time form
  validation.
- **NFR-UX-002**: System MUST confirm destructive actions and be responsive.
- **NFR-QUAL-001**: Critical accounting logic MUST be tested; complex functions MUST
  be documented.
- **NFR-QUAL-002**: System MUST handle errors robustly and optimize performance
  (lazy loading, streaming where applicable).

### Key Entities *(include if feature involves data)*

- **Bodega**: Unidad de almacenamiento con items asignados.
- **Item**: Producto disponible para asignacion con atributos de stock y costo.
- **Asignacion de Item**: Relacion entre item y bodega con valores de stock minimo, actual, maximo y costo promedio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% de los usuarios completan la asignacion de al menos un item en menos de 2 minutos.
- **SC-002**: 95% de las ediciones de stock y costo se completan sin errores en el primer intento.
- **SC-003**: 90% de los usuarios puede eliminar un item asignado sin asistencia.
- **SC-004**: La navegacion de la tabla con mas de 40 items permite encontrar un item objetivo en menos de 30 segundos.
