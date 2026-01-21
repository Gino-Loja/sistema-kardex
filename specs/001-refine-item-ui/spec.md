# Feature Specification: Refine Item UI

**Feature Branch**: `001-refine-item-ui`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "no quiero tener la miniatura en la tabla de items en la UI quita eso y en la pagina para ver la informacion quisiera ver mas grande la imagen y mas detalles del item. ademas quiero que las acciones sean responsivas en iconos por que sale sobremontado"

## Clarifications

### Session 2026-01-09

- Q: Como deben presentarse las acciones en pantallas reducidas para evitar superposicion? → A: Acciones visibles en escritorio; overflow en pantallas pequenas.
- Q: En que tamanos de pantalla debe usarse el menu de overflow? → A: Botones visibles en escritorio, overflow en pantallas pequenas.
- Q: Que rango define "pantallas pequenas"? → A: 320px-767px.
- Q: "Mas detalles del item" implica nuevos campos o mayor jerarquia visual? → A: Solo mayor jerarquia visual de los campos ya existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Revisar items sin miniaturas (Priority: P1)

Como usuario, quiero revisar la tabla de items sin miniaturas para enfocarme en los datos y acciones sin ruido visual.

**Why this priority**: La tabla es el punto principal de trabajo diario y debe ser clara y legible.

**Independent Test**: Se puede probar cargando la tabla y verificando que no exista columna de miniatura y que las acciones se vean sin superposicion.

**Acceptance Scenarios**:

1. **Given** que la tabla de items esta cargada, **When** reviso las columnas visibles, **Then** no aparece ninguna miniatura o imagen en la tabla.
2. **Given** que la tabla de items se muestra en pantallas pequenas y medianas, **When** observo las acciones por fila, **Then** ninguna accion se sobrepone y todas son distinguibles.

---

### User Story 2 - Ver detalle con imagen grande y datos utiles (Priority: P2)

Como usuario, quiero ver el detalle del item con una imagen mas grande y con mas informacion del item para confirmar rapidamente su identidad y estado.

**Why this priority**: La vista de detalle se usa para validaciones y decisiones; necesita mas contexto visual y de datos.

**Independent Test**: Se puede probar abriendo el detalle de un item con imagen y datos completos, verificando que la imagen sea destacada y que se presenten los atributos definidos.

**Acceptance Scenarios**:

1. **Given** un item con imagen principal, **When** abro la pagina de detalle del item, **Then** la imagen se muestra en un tamano prominente y facil de ver sin hacer zoom.
2. **Given** un item con datos registrados, **When** reviso el detalle, **Then** se muestran los atributos clave definidos para el item.

---

### User Story 3 - Acciones faciles de usar en pantalla reducida (Priority: P3)

Como usuario en movil, quiero que las acciones de la tabla se presenten como iconos responsivos para poder tocar cada accion sin errores.

**Why this priority**: En pantallas pequenas los controles se aprietan y hoy se superponen.

**Independent Test**: Se puede probar reduciendo el ancho de la ventana y verificando que cada accion siga siendo accesible y separada.

**Acceptance Scenarios**:

1. **Given** una pantalla pequena, **When** interactuo con los iconos de accion en la tabla, **Then** cada accion tiene su propio espacio y es clicable sin interferir con otras.
2. **Given** una pantalla pequena, **When** abro las acciones de una fila, **Then** se muestran dentro de un menu de overflow sin superposiciones.

---

### Edge Cases

- Item sin imagen: la vista de detalle muestra un placeholder visual y no rompe el layout.
- Nombre de item muy largo: el layout mantiene legibilidad sin superposiciones.
- Muchas acciones disponibles: la tabla mantiene cada accion distinguible en anchos reducidos.
- Item con datos incompletos: los campos faltantes se indican de forma clara.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ocultar cualquier miniatura o imagen en la tabla de items.
- **FR-002**: El sistema MUST mostrar la imagen principal del item en la vista de detalle con un tamano claramente mas grande que el de una miniatura tipica y visible sin zoom en pantallas comunes.
- **FR-003**: La vista de detalle MUST mostrar, como minimo, estos atributos del item cuando existan y con mayor jerarquia visual que la vista anterior: identificador o codigo, nombre, categoria, unidad de medida, stock actual o disponibilidad, costo, precio de venta y fecha de ultima actualizacion.
- **FR-004**: Las acciones de la tabla MUST mostrarse visibles en escritorio y agruparse en un menu de overflow (icono "...") en pantallas pequenas (320px-767px) para evitar superposicion y mantener cada accion distinguible.
- **FR-005**: Cada accion MUST ser comprensible por su icono y contar con un nombre accesible para usuarios con ayudas de lectura.

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

- **Item**: Producto del inventario con identificador, datos descriptivos, costos, precios y estado.
- **Imagen del item**: Imagen principal asociada al item para su identificacion visual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas de QA manual entre 320px y 1440px de ancho, no se observan acciones superpuestas ni recortadas en la tabla.
- **SC-002**: En pantallas de 320px de ancho, la imagen principal del item se visualiza completa sin zoom ni desplazamiento horizontal.
- **SC-003**: Para items con datos completos, el detalle muestra al menos 8 atributos definidos en FR-003.
- **SC-004**: En una prueba con usuarios internos, el 90% encuentra una accion del item en menos de 10 segundos desde la tabla.

## Assumptions

- Los atributos listados en FR-003 existen en el modelo de datos actual del item.
- La tabla de items ya cuenta con acciones principales (por ejemplo: ver, editar, eliminar) y solo se requiere ajustar su presentacion.
