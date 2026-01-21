# Feature Specification: Mejoras UX Movimientos - Estado y Costo Automático

**Feature Branch**: `004-movement-ux-fixes`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "El estado de los movimientos no puedo cambiarlo. Además cuando es de tipo salida no debería dejarme ingresar costo, según el ejemplo (Tarjeta Kárdex promedio ponderado) debería salir el costo promedio automáticamente."

## Clarifications

### Session 2026-01-16

- Q: ¿Qué usuarios pueden publicar/anular movimientos? → A: Cualquier usuario autenticado puede publicar/anular movimientos
- Q: ¿Qué ocurre al editar un borrador si el stock cambió desde su creación? → A: Validar stock al abrir formulario y mostrar advertencia si insuficiente

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar Movimiento desde Formulario (Priority: P1)

Como usuario del sistema de inventario, necesito poder cambiar el estado de un movimiento de "Borrador" a "Publicado" directamente desde la vista de detalle para confirmar que los datos están correctos y aplicar los cambios al inventario.

**Why this priority**: Sin esta funcionalidad, los movimientos quedan permanentemente en borrador y nunca afectan el stock ni el costo promedio. Es bloqueante para el flujo de trabajo.

**Independent Test**: Se puede verificar accediendo a un movimiento en estado borrador, presionando el botón "Publicar", y confirmando que el estado cambia a "Publicado" y el stock se actualiza.

**Acceptance Scenarios**:

1. **Given** existe un movimiento en estado "Borrador", **When** el usuario accede a la vista de detalle del movimiento, **Then** se muestra un botón "Publicar" prominente.
2. **Given** el usuario presiona "Publicar", **When** el sistema procesa la solicitud, **Then** solicita confirmación antes de ejecutar.
3. **Given** el usuario confirma la publicación, **When** el sistema publica el movimiento, **Then** el estado cambia a "Publicado", se actualiza el stock y se muestra mensaje de éxito.
4. **Given** un movimiento ya está "Publicado", **When** el usuario accede a la vista de detalle, **Then** NO se muestra el botón "Publicar" (ya no aplica).

---

### User Story 2 - Anular Movimiento Publicado (Priority: P2)

Como usuario del sistema de inventario, necesito poder anular un movimiento publicado para corregir errores sin eliminar el registro histórico.

**Why this priority**: Permite corrección de errores manteniendo la trazabilidad. Importante pero menos frecuente que la publicación.

**Independent Test**: Se puede verificar accediendo a un movimiento publicado, presionando "Anular", y confirmando que el estado cambia a "Anulado".

**Acceptance Scenarios**:

1. **Given** existe un movimiento en estado "Publicado", **When** el usuario accede a la vista de detalle, **Then** se muestra un botón "Anular".
2. **Given** el usuario presiona "Anular", **When** el sistema procesa, **Then** solicita confirmación con advertencia sobre el impacto en el inventario.
3. **Given** el usuario confirma la anulación, **When** el sistema anula el movimiento, **Then** el estado cambia a "Anulado" y se revierte el efecto en el stock.
4. **Given** un movimiento está "Anulado", **When** el usuario accede a la vista de detalle, **Then** NO se muestran botones de acción (estado final).

---

### User Story 3 - Costo Automático en Salidas (Priority: P1)

Como usuario del sistema de inventario, necesito que el campo de costo unitario se calcule automáticamente con el costo promedio actual cuando el tipo de movimiento es "Salida", para cumplir con el método de valoración promedio ponderado y evitar errores de captura.

**Why this priority**: Según el método promedio ponderado, las salidas DEBEN valorarse al costo promedio actual. Permitir ingreso manual viola el método contable y genera inconsistencias. Es crítico para la integridad del sistema.

**Independent Test**: Se puede verificar creando un movimiento de salida, seleccionando un ítem, y confirmando que el campo de costo muestra el promedio actual y no es editable.

**Acceptance Scenarios**:

1. **Given** el usuario está creando un movimiento de tipo "Salida", **When** selecciona un ítem con costo promedio de $499.23 en la bodega origen, **Then** el campo "Costo Unitario" muestra $499.23 automáticamente.
2. **Given** el tipo de movimiento es "Salida", **When** el usuario intenta editar el campo de costo unitario, **Then** el campo está deshabilitado/bloqueado y no permite modificación.
3. **Given** el usuario cambia de tipo "Entrada" a "Salida", **When** ya hay ítems seleccionados, **Then** los costos se actualizan automáticamente al costo promedio de cada ítem.
4. **Given** el ítem no tiene stock previo en la bodega (costo promedio $0), **When** se selecciona para salida, **Then** el sistema muestra advertencia "Sin costo promedio establecido".

---

### User Story 4 - Costo Editable en Entradas (Priority: P1)

Como usuario del sistema de inventario, necesito poder ingresar el costo unitario manualmente cuando el tipo de movimiento es "Entrada", ya que las compras tienen un precio de adquisición específico que debe registrarse.

**Why this priority**: Las entradas de compra requieren ingresar el costo real de adquisición para recalcular el promedio ponderado. Es la contraparte de la User Story 3.

**Independent Test**: Se puede verificar creando un movimiento de entrada y confirmando que el campo de costo está habilitado para edición.

**Acceptance Scenarios**:

1. **Given** el usuario está creando un movimiento de tipo "Entrada", **When** el formulario carga, **Then** el campo "Costo Unitario" está habilitado y vacío (valor inicial 0).
2. **Given** el tipo es "Entrada" y el usuario ingresa costo $510.00, **When** cambia el tipo a "Salida", **Then** el costo se reemplaza automáticamente con el costo promedio del ítem.
3. **Given** el tipo es "Entrada", **When** el usuario deja el costo en $0, **Then** el sistema permite guardar (válido para donaciones o ajustes).

---

### User Story 5 - Visualizar Estado del Movimiento (Priority: P2)

Como usuario del sistema, necesito ver claramente el estado actual de cada movimiento (Borrador, Publicado, Anulado) en el listado y en la vista de detalle para entender qué movimientos ya afectaron el inventario.

**Why this priority**: La visibilidad del estado permite entender el flujo de trabajo y tomar decisiones informadas.

**Independent Test**: Se puede verificar revisando el listado de movimientos y confirmando que cada uno muestra su estado con indicador visual.

**Acceptance Scenarios**:

1. **Given** existen movimientos en diferentes estados, **When** el usuario ve el listado de movimientos, **Then** cada registro muestra un badge/chip con el estado (colores: Borrador=gris, Publicado=verde, Anulado=rojo).
2. **Given** el usuario accede a la vista de detalle de un movimiento, **When** carga la página, **Then** el estado se muestra prominentemente en el encabezado.

---

### Edge Cases

- ¿Qué sucede si se intenta publicar un movimiento de salida pero el stock ya no es suficiente (cambió desde la creación)?
  - El sistema valida stock disponible al momento de publicar y rechaza si es insuficiente.
- ¿Qué ocurre si se cambia el tipo de movimiento y hay ítems con costo manual ingresado?
  - Los costos se recalculan/reemplazan según el nuevo tipo.
- ¿Cómo se comporta el costo automático en transferencias?
  - El costo de salida (bodega origen) usa el promedio de esa bodega.
- ¿Qué pasa si se intenta anular un movimiento que generó otros movimientos dependientes?
  - Fuera del alcance de esta iteración (advertencia simple).
- ¿Qué sucede si se edita un borrador de salida y el stock ya no es suficiente?
  - El sistema valida al abrir el formulario y muestra advertencia; permite editar pero no publicar sin ajustar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEBE mostrar botón "Publicar" en la vista de detalle de movimientos con estado "Borrador"
- **FR-002**: Sistema DEBE mostrar botón "Anular" en la vista de detalle de movimientos con estado "Publicado"
- **FR-003**: Sistema DEBE solicitar confirmación antes de publicar o anular un movimiento
- **FR-004**: Sistema DEBE actualizar el estado del movimiento tras publicar (Borrador → Publicado) o anular (Publicado → Anulado)
- **FR-005**: Sistema DEBE bloquear el campo "Costo Unitario" cuando el tipo de movimiento es "Salida"
- **FR-006**: Sistema DEBE calcular automáticamente el costo unitario usando el costo promedio del ítem+bodega cuando el tipo es "Salida"
- **FR-007**: Sistema DEBE permitir edición manual del campo "Costo Unitario" cuando el tipo de movimiento es "Entrada"
- **FR-008**: Sistema DEBE actualizar los costos automáticamente cuando el usuario cambia el tipo de movimiento de Entrada a Salida
- **FR-009**: Sistema DEBE mostrar el estado del movimiento con indicadores visuales (badges con colores) en listado y detalle
- **FR-010**: Sistema DEBE validar stock disponible al momento de publicar (no solo al guardar borrador)
- **FR-011**: Sistema DEBE mostrar advertencia cuando un ítem no tiene costo promedio establecido ($0) en movimientos de salida
- **FR-012**: Sistema DEBE aplicar el costo promedio de la bodega origen en movimientos de tipo "Transferencia"
- **FR-013**: Sistema DEBE validar stock disponible al abrir el formulario de edición de un borrador de salida/transferencia y mostrar advertencia si es insuficiente

### Key Entities

- **Movimiento**: Entidad existente. Se añade lógica de transición de estados desde la UI.
- **ItemBodega**: Entidad existente. Se consulta para obtener el costo promedio por ítem+bodega.
- **DetalleMovimiento**: Entidad existente. El campo `costoUnitario` se calcula automáticamente en salidas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de los movimientos en borrador pueden ser publicados desde la vista de detalle en menos de 3 clics
- **SC-002**: 100% de los movimientos publicados pueden ser anulados desde la vista de detalle
- **SC-003**: El campo de costo unitario está deshabilitado en 100% de los movimientos de tipo "Salida"
- **SC-004**: El costo automático en salidas coincide exactamente con el costo promedio registrado en itemBodegas
- **SC-005**: Los usuarios identifican visualmente el estado de los movimientos en el listado sin necesidad de abrir el detalle
- **SC-006**: 0% de errores de costo incorrecto en salidas al usar el cálculo automático
- **SC-007**: La validación de stock al publicar rechaza 100% de los movimientos que excedan la disponibilidad actual

## Assumptions

- Las acciones de servidor `publicarMovimiento()` y `anularMovimiento()` ya existen en el backend
- La tabla `itemBodegas` tiene el campo `costoPromedio` actualizado correctamente
- Los movimientos de tipo "Transferencia" usan el costo de la bodega origen
- La anulación revierte el stock pero NO recalcula el costo promedio retroactivamente (simplificación)
- El campo `estado` en la tabla `movimientos` acepta los valores: "borrador", "publicado", "anulado"
- Cualquier usuario autenticado puede publicar y anular movimientos (sin restricción de rol)
