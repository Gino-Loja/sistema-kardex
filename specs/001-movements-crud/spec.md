# Feature Specification: Gestión de Movimientos de Inventario (CRUD)

**Feature Branch**: `001-movements-crud`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Crear, editar y eliminar movimientos de inventario con tipos entrada, salida y transferencia. Bodega origen/destino solo visible para transferencias."

## Clarifications

### Session 2026-01-14

- Q: ¿Los campos de bodega se muestran siempre o condicionalmente según el tipo? → A: Mostrar campos condicionalmente según tipo (Entrada: solo destino, Salida: solo origen, Transferencia: ambos)
- Q: ¿El formulario permite múltiples ítems por movimiento? → A: Sí, permitir múltiples ítems con líneas dinámicas (agregar/quitar)
- Q: ¿Debe incluirse el tipo "Ajuste" en esta funcionalidad? → A: No, mantener solo 3 tipos (entrada, salida, transferencia) - ajuste fuera del alcance

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear Movimiento de Entrada (Priority: P1)

Como usuario del sistema de inventario, necesito registrar entradas de productos al almacén para mantener el stock actualizado cuando recibo mercancía de proveedores.

**Why this priority**: Las entradas son el flujo principal para incrementar el inventario. Sin esta funcionalidad, no se puede registrar mercancía recibida.

**Independent Test**: Se puede verificar creando un movimiento de entrada, seleccionando un ítem, cantidad y bodega, y confirmando que el movimiento queda registrado en el sistema.

**Acceptance Scenarios**:

1. **Given** el usuario está en la página de crear movimiento, **When** selecciona tipo "Entrada", ítem, bodega destino, cantidad, costo unitario, tercero relacionado y guarda, **Then** el sistema registra el movimiento y muestra confirmación de éxito.
2. **Given** el usuario selecciona tipo "Entrada", **When** el formulario se carga, **Then** solo muestra el campo "Bodega Destino" (no muestra "Bodega Origen").
3. **Given** el usuario ingresa todos los campos requeridos, **When** presiona "Guardar Movimiento", **Then** el total estimado se calcula como cantidad × costo unitario.

---

### User Story 2 - Crear Movimiento de Salida (Priority: P1)

Como usuario del sistema de inventario, necesito registrar salidas de productos del almacén para reflejar cuando se despacha mercancía a clientes.

**Why this priority**: Las salidas son esenciales para decrementar el inventario. Junto con las entradas, conforman las operaciones básicas del kardex.

**Independent Test**: Se puede verificar creando un movimiento de salida, seleccionando un ítem, cantidad y bodega origen, y confirmando que el movimiento queda registrado.

**Acceptance Scenarios**:

1. **Given** el usuario está en la página de crear movimiento, **When** selecciona tipo "Salida", ítem, bodega origen, cantidad, tercero relacionado y guarda, **Then** el sistema registra el movimiento de salida.
2. **Given** el usuario selecciona tipo "Salida", **When** el formulario se carga, **Then** solo muestra el campo "Bodega Origen" (no muestra "Bodega Destino").
3. **Given** el usuario intenta registrar una salida con cantidad mayor al stock disponible, **When** presiona guardar, **Then** el sistema muestra un mensaje de error indicando stock insuficiente.

---

### User Story 3 - Crear Movimiento de Transferencia (Priority: P2)

Como usuario del sistema de inventario, necesito transferir productos entre bodegas para redistribuir el inventario según las necesidades operativas.

**Why this priority**: Las transferencias son importantes pero menos frecuentes que entradas/salidas. Permiten mover stock entre ubicaciones sin afectar el inventario total.

**Independent Test**: Se puede verificar creando una transferencia entre dos bodegas diferentes y confirmando que el movimiento queda registrado con ambas bodegas.

**Acceptance Scenarios**:

1. **Given** el usuario está en la página de crear movimiento, **When** selecciona tipo "Transferencia", **Then** el formulario muestra ambos campos: "Bodega Origen" y "Bodega Destino".
2. **Given** el usuario selecciona transferencia con bodega origen y destino iguales, **When** intenta guardar, **Then** el sistema muestra error indicando que las bodegas deben ser diferentes.
3. **Given** el usuario completa todos los campos de transferencia correctamente, **When** guarda, **Then** el sistema registra el movimiento con origen y destino especificados.

---

### User Story 4 - Editar Movimiento Existente (Priority: P2)

Como usuario del sistema de inventario, necesito modificar movimientos registrados para corregir errores de captura antes de que sean procesados.

**Why this priority**: Permite corrección de errores sin necesidad de eliminar y recrear movimientos, mejorando la eficiencia operativa.

**Independent Test**: Se puede verificar editando un movimiento existente, modificando la cantidad, y confirmando que los cambios se reflejan correctamente.

**Acceptance Scenarios**:

1. **Given** existe un movimiento en estado "Borrador", **When** el usuario accede a la página de edición, **Then** puede modificar todos los campos del movimiento.
2. **Given** el usuario modifica un movimiento, **When** guarda los cambios, **Then** el sistema actualiza el registro y muestra confirmación.
3. **Given** un movimiento ya fue procesado/confirmado, **When** el usuario intenta editarlo, **Then** el sistema no permite la edición e indica el motivo.

---

### User Story 5 - Eliminar Movimiento (Priority: P3)

Como usuario del sistema de inventario, necesito eliminar movimientos incorrectos para mantener registros limpios y precisos.

**Why this priority**: Es una operación menos frecuente pero necesaria para corrección de datos. Debe tener restricciones para evitar pérdida de información importante.

**Independent Test**: Se puede verificar eliminando un movimiento en borrador y confirmando que ya no aparece en el listado.

**Acceptance Scenarios**:

1. **Given** existe un movimiento en estado "Borrador", **When** el usuario solicita eliminarlo, **Then** el sistema muestra confirmación antes de proceder.
2. **Given** el usuario confirma la eliminación, **When** el sistema procesa la solicitud, **Then** el movimiento se elimina permanentemente y se muestra mensaje de éxito.
3. **Given** un movimiento ya fue procesado/confirmado, **When** el usuario intenta eliminarlo, **Then** el sistema rechaza la operación e indica el motivo.

---

### Edge Cases

- ¿Qué sucede cuando el usuario selecciona un ítem que no tiene stock en ninguna bodega para una salida?
- ¿Cómo maneja el sistema la selección de bodegas cuando solo existe una bodega registrada?
- ¿Qué ocurre si el usuario cambia el tipo de movimiento después de haber seleccionado bodegas?
- ¿Cómo se comporta el formulario si el costo unitario se deja en 0?
- ¿Qué sucede si se intenta guardar sin seleccionar un ítem?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEBE permitir crear movimientos de tipo Entrada, Salida y Transferencia
- **FR-002**: Sistema DEBE mostrar campos de bodega condicionalmente según el tipo de movimiento:
  - Entrada: solo Bodega Destino
  - Salida: solo Bodega Origen
  - Transferencia: Bodega Origen y Bodega Destino
- **FR-003**: Sistema DEBE calcular automáticamente el Total Estimado como Cantidad × Costo Unitario
- **FR-004**: Sistema DEBE permitir búsqueda de ítems por código SKU o nombre del producto
- **FR-016**: Sistema DEBE permitir agregar múltiples líneas de ítems al mismo movimiento (mínimo 1 línea requerida)
- **FR-017**: Sistema DEBE permitir eliminar líneas de ítems del movimiento (excepto si queda solo 1 línea)
- **FR-005**: Sistema DEBE validar que la bodega origen y destino sean diferentes en transferencias
- **FR-006**: Sistema DEBE validar stock disponible antes de permitir salidas o transferencias
- **FR-007**: Sistema DEBE permitir editar movimientos en estado Borrador
- **FR-008**: Sistema DEBE permitir eliminar movimientos en estado Borrador
- **FR-009**: Sistema DEBE impedir edición/eliminación de movimientos ya procesados
- **FR-010**: Sistema DEBE solicitar confirmación antes de eliminar un movimiento
- **FR-011**: Sistema DEBE mostrar la fecha del movimiento (por defecto, fecha actual)
- **FR-012**: Sistema DEBE permitir asociar un Tercero Relacionado (proveedor o cliente) al movimiento
- **FR-013**: Sistema DEBE permitir ingresar un Número de Documento de Referencia opcional
- **FR-014**: Sistema DEBE permitir agregar Observaciones opcionales al movimiento
- **FR-015**: Sistema DEBE permitir seleccionar el Estado del movimiento (Borrador por defecto)

### Key Entities

- **Movimiento**: Representa una transacción de inventario. Atributos: tipo (entrada/salida/transferencia), fecha, ítem, cantidad, costo unitario, total estimado, bodega origen, bodega destino, tercero relacionado, documento referencia, observaciones, estado.
- **Ítem**: Producto del inventario identificado por SKU o nombre.
- **Bodega**: Ubicación de almacenamiento donde se guarda el inventario.
- **Tercero**: Proveedor o cliente relacionado con el movimiento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuarios pueden crear un movimiento de entrada completo en menos de 60 segundos
- **SC-002**: Usuarios pueden crear un movimiento de salida completo en menos de 60 segundos
- **SC-003**: Usuarios pueden crear un movimiento de transferencia completo en menos de 90 segundos
- **SC-004**: 100% de los movimientos muestran los campos de bodega correctos según el tipo seleccionado
- **SC-005**: El cálculo del total estimado se actualiza instantáneamente al modificar cantidad o costo
- **SC-006**: 0% de movimientos con bodega origen igual a destino pueden ser guardados en transferencias
- **SC-007**: Usuarios pueden editar y guardar cambios en un movimiento borrador en menos de 30 segundos
- **SC-008**: El sistema muestra confirmación de eliminación en 100% de los casos antes de proceder

## Assumptions

- El sistema ya cuenta con bodegas, ítems y terceros registrados previamente
- Los usuarios tienen permisos para crear, editar y eliminar movimientos
- El estado "Borrador" permite modificaciones; otros estados (confirmado/procesado) son de solo lectura
- El costo unitario puede ser 0 para movimientos que no requieren valoración
- La fecha del movimiento se puede modificar (no está restringida a fecha actual)
- El campo de tercero relacionado es opcional para permitir movimientos internos sin proveedor/cliente
- El tipo "Ajuste" está fuera del alcance de esta funcionalidad (se implementará en una iteración futura)
- Un movimiento debe tener al menos 1 línea de ítem; puede tener múltiples líneas
