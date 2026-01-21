# Feature Specification: Category actions (edit/delete)

**Feature Branch**: `001-category-actions`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "crea las acciones de las categorias editar http://localhost:3000/categories/[id]/edit y eliminar un modal."

## Clarifications

### Session 2026-01-09

- Q: Que debe pasar cuando se elimina una categoria que tiene items asociados? → A: Permitir la eliminacion y dejar los items sin categoria.
- Q: Como deben mostrarse las acciones no permitidas por permisos? → A: Ocultar acciones no permitidas.
- Q: Como debe confirmarse una eliminacion exitosa en la lista? → A: Mostrar confirmacion en la lista (toast o banner).
- Q: Que debe mostrar el modal de confirmacion de eliminacion? → A: Texto "Eliminar categoria" y mensaje de impacto (items quedaran sin categoria).
- Q: Como manejar cuando la categoria ya fue eliminada antes de confirmar? → A: Silenciar el error y cerrar el modal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar una categoria desde la lista (Priority: P1)

Como usuario con permisos de gestion, quiero acceder a la pantalla de edicion desde las acciones de una categoria para actualizar sus datos rapidamente.

**Why this priority**: Mantiene el flujo principal de mantenimiento de categorias con el menor esfuerzo.

**Independent Test**: Puede probarse seleccionando una categoria y usando la accion "Editar" para llegar a la pantalla de edicion.

**Acceptance Scenarios**:

1. **Given** que el usuario ve la lista de categorias, **When** abre las acciones de una categoria y elige "Editar", **Then** llega a la pantalla de edicion de esa categoria.
2. **Given** que el usuario no tiene permisos de edicion, **When** abre las acciones, **Then** la opcion "Editar" no esta disponible.

---

### User Story 2 - Eliminar una categoria con confirmacion (Priority: P2)

Como usuario con permisos de gestion, quiero eliminar una categoria desde sus acciones con un modal de confirmacion para evitar errores.

**Why this priority**: Reduce eliminaciones accidentales y completa el conjunto de acciones basicas.

**Independent Test**: Puede probarse seleccionando "Eliminar" y confirmando o cancelando en el modal.

**Acceptance Scenarios**:

1. **Given** que el usuario abre las acciones de una categoria, **When** elige "Eliminar", **Then** se muestra un modal con el texto "Eliminar categoria", un mensaje de impacto (items quedaran sin categoria) y opciones para confirmar o cancelar.
2. **Given** que el usuario confirma la eliminacion, **When** la categoria se elimina correctamente, **Then** la categoria deja de aparecer en la lista y se muestra una confirmacion en la lista.
3. **Given** que el usuario cancela la eliminacion, **When** cierra el modal, **Then** no se realiza ningun cambio en la lista.

---

### Edge Cases

- Que sucede cuando se elimina una categoria en uso y los items quedan sin categoria?
- Que sucede si ocurre un error al eliminar (por ejemplo, fallo de red)?
- Que sucede si la categoria ya fue eliminada por otro usuario antes de confirmar (se cierra el modal sin mensaje)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un conjunto de acciones por cada categoria en la lista.
- **FR-002**: El sistema MUST permitir navegar a la pantalla de edicion de una categoria desde sus acciones.
- **FR-003**: El sistema MUST mostrar un modal de confirmacion antes de completar la eliminacion de una categoria.
- **FR-004**: El sistema MUST permitir cancelar la eliminacion desde el modal sin cambios en los datos.
- **FR-005**: El sistema MUST mostrar un mensaje claro de exito o error despues de intentar eliminar.
- **FR-006**: El sistema MUST permitir eliminar una categoria en uso y dejar los items asociados sin categoria.
- **FR-007**: El sistema MUST ocultar acciones no permitidas segun permisos del usuario.

**Assumptions**:
- Existe una pantalla de edicion de categoria accesible desde la lista de categorias.
- Cuando se elimina una categoria con items asociados, los items quedan sin categoria.

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

- **Categoria**: Agrupador de items, con nombre y estado; puede estar asociada a uno o varios items.
- **Item**: Producto o articulo que puede referenciar una categoria; la categoria puede ser nula.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% de los usuarios pueden llegar a la edicion de una categoria en 2 clics o menos desde la lista.
- **SC-002**: 100% de las eliminaciones requieren confirmacion explicita antes de completarse.
- **SC-003**: 95% de las eliminaciones exitosas se reflejan en la lista en menos de 5 segundos.
- **SC-004**: Se reduce a menos de 1 por trimestre el numero de eliminaciones accidentales reportadas.
