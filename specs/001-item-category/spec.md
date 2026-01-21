# Feature Specification: Item nombre y categoria opcional

**Feature Branch**: `001-item-category`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "quieroque crees un nuevo campo en la tabla item que se llame nombre y crees una nueva tabla categoria y este item se pueda asociar en una categoria pero esto debe ser opcional"

## Clarifications

### Session 2026-01-08

- Q: ¿Las categorias son globales para todo el sistema o son por bodega/almacen? → A: Globales para todo el sistema.
- Q: ¿La unicidad del nombre de categoria es estricta (no se permite repetir) o solo sugerida (se permite repetir con aviso)? → A: Estricta por catalogo (no se repite dentro del catalogo).
- Q: ¿Un item puede pertenecer a mas de una categoria? → A: No, solo una categoria.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear item con nombre y categoria opcional (Priority: P1)

Como usuario que registra items, quiero crear un item con un nombre y, si deseo, seleccionar una categoria, para tener un inventario claro desde el inicio.

**Why this priority**: Es el flujo principal para registrar items y aporta valor inmediato.

**Independent Test**: Se prueba creando un item nuevo con nombre y con o sin categoria, verificando que queda registrado.

**Acceptance Scenarios**:

1. **Given** que existe al menos una categoria, **When** creo un item con nombre y selecciono una categoria, **Then** el item queda guardado con esa categoria.
2. **Given** que no selecciono categoria, **When** creo un item con nombre, **Then** el item queda guardado sin categoria asignada.

---

### User Story 2 - Crear categorias disponibles para items (Priority: P2)

Como usuario que administra catalogos, quiero crear categorias para poder clasificar los items.

**Why this priority**: Sin categorias, la asociacion no aporta valor. Este flujo habilita la clasificacion.

**Independent Test**: Se prueba creando una categoria nueva y verificando que aparece en la lista de categorias.

**Acceptance Scenarios**:

1. **Given** que deseo una nueva categoria, **When** registro un nombre de categoria valido, **Then** la categoria queda disponible para asignar a items.

---

### User Story 3 - Cambiar o quitar categoria de un item (Priority: P3)

Como usuario que mantiene el inventario, quiero cambiar o quitar la categoria de un item para mantener la clasificacion actualizada.

**Why this priority**: Permite mantener la calidad de datos con el tiempo.

**Independent Test**: Se prueba editando un item existente y asignando o quitando la categoria.

**Acceptance Scenarios**:

1. **Given** un item con categoria, **When** quito la categoria, **Then** el item queda sin categoria y sigue operativo.

---

### Edge Cases

- Crear un item con nombre vacio o solo espacios.
- Crear un item cuando no existen categorias.
- Intentar crear una categoria con un nombre ya existente.
- Eliminar o desactivar una categoria que ya tiene items asociados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST requerir un nombre no vacio al crear un item.
- **FR-002**: El sistema MUST permitir crear un item con nombre y con categoria opcional.
- **FR-003**: El sistema MUST permitir crear categorias con un nombre valido.
- **FR-004**: El sistema MUST mostrar categorias disponibles al crear o editar un item.
- **FR-005**: El sistema MUST permitir asignar, cambiar o quitar la categoria de un item.
- **FR-006**: El sistema MUST mantener items sin categoria como registros validos y operativos.
- **FR-007**: El sistema MUST evitar que la eliminacion de una categoria elimine items asociados; esos items quedan sin categoria.
- **FR-008**: El sistema MUST permitir como maximo una categoria por item.

### Acceptance Criteria

- **AC-001 (FR-001)**: Si el nombre del item esta vacio, el sistema rechaza el guardado y muestra un mensaje claro.
- **AC-002 (FR-002)**: Al crear un item con nombre y una categoria seleccionada, el item queda guardado con esa categoria.
- **AC-003 (FR-002)**: Al crear un item con nombre y sin categoria, el item queda guardado sin categoria.
- **AC-004 (FR-003)**: Una categoria con nombre valido se guarda y aparece en la lista de categorias.
- **AC-005 (FR-004)**: La lista de categorias aparece en los flujos de crear y editar item.
- **AC-006 (FR-005)**: Un item existente puede cambiar o quitar su categoria y el cambio se refleja en la vista del item.
- **AC-007 (FR-006, FR-007)**: Si una categoria se elimina o desactiva, los items asociados permanecen y quedan sin categoria.
- **AC-008 (FR-003)**: Si el nombre ya existe en el catalogo, el sistema rechaza la creacion y muestra un mensaje claro.

### Non-Functional Requirements (Constitutional)

- **NFR-SEC-001**: El sistema MUST proteger operaciones y aplicar permisos por rol
  (Admin, Bodeguero).
- **NFR-SEC-002**: El sistema MUST validar entradas y manejar cargas de archivos de
  forma segura.
- **NFR-SEC-003**: El sistema MUST registrar auditoria de operaciones criticas.
- **NFR-DATA-001**: El sistema MUST mantener consistencia entre registros y evitar
  actualizaciones parciales en operaciones criticas.
- **NFR-DATA-002**: El sistema MUST cumplir reglas NIC 2 y mantener un registro
  historico de movimientos que no se modifica.
- **NFR-DATA-003**: El sistema MUST calcular el costo promedio ponderado
  automaticamente.
- **NFR-UX-001**: El sistema MUST mostrar estados de carga/error claros y validacion
  inmediata.
- **NFR-UX-002**: El sistema MUST confirmar acciones destructivas y ser responsivo.
- **NFR-QUAL-001**: La logica contable critica MUST estar probada; funciones
  complejas MUST estar documentadas.
- **NFR-QUAL-002**: El sistema MUST manejar errores de forma robusta y mantener
  buen rendimiento para uso tipico y grandes volumenes.

### Key Entities *(include if feature involves data)*

- **Item**: Registro de inventario con nombre obligatorio y una categoria opcional.
- **Categoria**: Clasificacion disponible para agrupar items.
- **Item-Categoria**: Relacion opcional que asocia un item con una categoria.

### Assumptions

- Un item solo puede pertenecer a una categoria a la vez.
- El nombre de categoria es unico dentro del catalogo.
- Las categorias son globales para todo el sistema (no por bodega).
- La gestion de permisos sigue el mismo alcance que la gestion de items actual.

### Dependencies

- Depende de los flujos actuales de creacion y edicion de items para exponer la seleccion de categoria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% de los intentos de creacion de items con nombre valido se completan con exito en pruebas de aceptacion.
- **SC-002**: 90% de los usuarios de prueba pueden crear una categoria y asignarla a un item en menos de 2 minutos.
- **SC-003**: 90% de los usuarios de prueba pueden quitar la categoria de un item en el primer intento.
- **SC-004**: La tasa de tickets de soporte relacionados con identificacion de items se reduce en 50% dentro de 30 dias.
