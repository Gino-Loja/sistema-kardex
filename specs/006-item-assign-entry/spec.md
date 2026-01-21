# Feature Specification: Movimiento de Entrada Automático al Asignar Items a Bodega

**Feature Branch**: `006-item-assign-entry`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Crear movimiento de entrada automático al asignar item a bodega - Cuando se asigna un item a una bodega con stock y costo inicial, el sistema debe crear automáticamente un movimiento de tipo entrada para que el kardex refleje correctamente el inventario"

## Clarifications

### Session 2026-01-19

- Q: Cuando se asignan múltiples items en una sola operación, ¿cómo se estructuran los movimientos? → A: Un solo movimiento de entrada con múltiples líneas de detalle (un `detalleMovimiento` por item).
- Q: Cuando se asignan múltiples items y uno falla validación, ¿cuál es el comportamiento? → A: Transacción atómica (todo o nada): si un item falla, se revierte todo y no se asigna ninguno.

## Resumen del Problema

Actualmente, cuando un usuario asigna items a una bodega:
1. Se crea un registro en `item_bodegas` con stock y costo inicial
2. **NO se crea un movimiento de entrada** en la tabla `movimientos`
3. El kardex depende de la tabla `movimientos` para mostrar el historial
4. **Resultado**: El kardex no refleja el stock real de la bodega

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Asignar Item con Stock Inicial (Priority: P1)

Como encargado de bodega, quiero que cuando asigne un item a una bodega con stock y costo inicial, se cree automáticamente un movimiento de entrada, para que el kardex refleje correctamente todo el inventario desde el primer día.

**Why this priority**: Esta es la funcionalidad core que resuelve el problema reportado. Sin esto, el kardex siempre mostrará datos incompletos.

**Independent Test**: Puede probarse asignando un item nuevo a una bodega con stock=15 y costo=72.67, verificando que aparezca el movimiento en el kardex con cantidad=15 y valor total correcto.

**Acceptance Scenarios**:

1. **Given** una bodega existente sin el item TI-001 asignado, **When** el usuario asigna TI-001 con stock_inicial=15 y costo_unitario=72.67, **Then** se crea un movimiento de entrada publicado con cantidad=15 y costo_unitario=72.67, y el kardex muestra Total Entradas=$1090.05 y Existencia Final=15.

2. **Given** un item ya asignado a la bodega con stock=10, **When** el usuario intenta asignar el mismo item nuevamente, **Then** el sistema rechaza la operación con un mensaje indicando que el item ya está asignado a esa bodega.

3. **Given** una bodega con "Actualización Automática de Costo Promedio" activada, **When** el usuario asigna un item con stock=15 y costo=72.67, **Then** el movimiento de entrada actualiza el costo promedio en `item_bodegas` usando el servicio de promedio ponderado existente.

---

### User Story 2 - Asignar Múltiples Items Simultáneamente (Priority: P2)

Como encargado de bodega, quiero poder asignar varios items a una bodega en una sola operación, cada uno con su stock y costo inicial correspondiente, para agilizar el proceso de carga inicial de inventario.

**Why this priority**: Mejora la experiencia del usuario al reducir el trabajo manual cuando se configura una nueva bodega o se agregan múltiples productos.

**Independent Test**: Puede probarse asignando 3 items diferentes a una bodega en una sola operación, verificando que se cree un único movimiento con 3 líneas de detalle.

**Acceptance Scenarios**:

1. **Given** una bodega sin items asignados, **When** el usuario asigna items TI-001 (stock=15, costo=72.67), TI-002 (stock=5, costo=50), y TI-003 (stock=20, costo=100) en una sola operación, **Then** se crea un único movimiento de entrada publicado con 3 líneas de detalle (una por item), y el kardex de cada item muestra su entrada inicial correctamente.

2. **Given** una bodega con TI-001 ya asignado, **When** el usuario intenta asignar TI-001, TI-002 y TI-003 juntos, **Then** el sistema rechaza toda la operación sin asignar ningún item, mostrando un mensaje que indica que TI-001 ya está asignado a esa bodega.

---

### User Story 3 - Asignar Item sin Stock Inicial (Priority: P3)

Como encargado de bodega, quiero poder asignar un item a una bodega sin especificar stock inicial (stock=0), sin que se cree un movimiento de entrada vacío, para preparar la bodega para futuras entradas.

**Why this priority**: Permite configurar bodegas anticipadamente sin contaminar el historial de movimientos con entradas vacías.

**Independent Test**: Puede probarse asignando un item con stock=0, verificando que NO aparezca ningún movimiento en el kardex.

**Acceptance Scenarios**:

1. **Given** una bodega sin el item TI-004 asignado, **When** el usuario asigna TI-004 con stock_inicial=0 (o sin especificar stock), **Then** se crea el registro en `item_bodegas` pero NO se crea ningún movimiento de entrada, y el kardex del item muestra Existencia Final=0 y Total Entradas=$0.

2. **Given** un item asignado con stock=0, **When** posteriormente se crea un movimiento de entrada manual con cantidad=10, **Then** el kardex refleja correctamente esa primera entrada.

---

### Edge Cases

- **Stock negativo**: El sistema debe rechazar asignaciones con stock_inicial < 0 mostrando un mensaje de error claro.
- **Costo unitario negativo**: El sistema debe rechazar asignaciones con costo_unitario < 0 mostrando un mensaje de error claro.
- **Costo cero con stock mayor a cero**: El sistema debe permitir esta combinación (items de cortesía o donaciones), creando el movimiento con costo=0.
- **Bodega inactiva**: El sistema debe impedir asignar items a bodegas con estado "Inactivo".
- **Item inexistente**: Si se intenta asignar un itemId que no existe, el sistema debe rechazar la operación con mensaje de error.
- **Bodega inexistente**: Si se intenta asignar a un bodegaId que no existe, el sistema debe rechazar la operación con mensaje de error.
- **Valores decimales extremos**: El sistema debe manejar correctamente stocks y costos con muchos decimales (ej: 15.123456789), redondeando según las reglas del negocio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE crear automáticamente un movimiento de tipo "entrada" cuando se asigna un item a una bodega con stock_inicial > 0.
- **FR-002**: El movimiento de entrada creado DEBE incluir: bodega destino, item, cantidad igual al stock_inicial, y costo unitario.
- **FR-003**: El movimiento de entrada DEBE publicarse automáticamente (estado="publicado") para que aparezca en el kardex.
- **FR-004**: El sistema DEBE actualizar el costo promedio en `item_bodegas` usando el servicio de promedio ponderado existente cuando la bodega tiene la opción "Actualización Automática de Costo Promedio" activada.
- **FR-005**: El sistema NO DEBE crear movimientos de entrada cuando stock_inicial = 0 o no se especifica.
- **FR-006**: El sistema DEBE rechazar asignaciones con stock_inicial < 0 o costo_unitario < 0.
- **FR-007**: El sistema DEBE validar que el item no esté ya asignado a la misma bodega antes de crear el registro y movimiento.
- **FR-008**: El sistema DEBE permitir asignar múltiples items en una sola operación, creando un único movimiento de entrada con múltiples líneas de detalle (una por cada item con stock > 0).
- **FR-009**: El sistema DEBE validar que tanto el item como la bodega existan antes de procesar la asignación.
- **FR-010**: El sistema DEBE registrar la fecha actual como fecha del movimiento de entrada inicial.
- **FR-011**: El sistema DEBE ejecutar la asignación múltiple de items como una transacción atómica: si cualquier item falla la validación, se revierte toda la operación y no se asigna ningún item.

### Key Entities

- **ItemBodega**: Representa la relación entre un item y una bodega, incluyendo stock actual y costo promedio.
- **Movimiento**: Representa una operación de entrada o salida de inventario, con tipo, fecha, estado y bodega destino/origen.
- **DetalleMovimiento**: Representa cada línea de un movimiento, con item, cantidad y costo unitario.
- **Bodega**: Almacén donde se almacenan items, con opción de actualización automática de costo promedio.
- **Item**: Producto del inventario con código, nombre, unidad y categoría.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El kardex de un item recién asignado muestra el stock inicial y valor total dentro de los 2 segundos siguientes a la asignación.
- **SC-002**: El 100% de las asignaciones con stock > 0 generan un movimiento de entrada visible en el kardex.
- **SC-003**: El costo promedio calculado tras la asignación inicial coincide con el costo unitario especificado (variación < 0.01%).
- **SC-004**: La asignación de hasta 50 items simultáneos se completa exitosamente en una sola transacción.
- **SC-005**: El sistema previene el 100% de las asignaciones duplicadas (mismo item a misma bodega).
- **SC-006**: Los usuarios pueden verificar que su asignación fue exitosa consultando el kardex inmediatamente después de la operación.

## Assumptions

- El servicio de promedio ponderado (`weighted-average.service.ts`) ya está implementado y funcionando correctamente.
- El flujo de publicación de movimientos (`movements.service.ts`) ya está implementado y funcionando.
- La tabla `item_bodegas` ya tiene los campos `stockActual` y `costoPromedio`.
- El flag `autoUpdateAverageCost` de la bodega ya está implementado y controla si se actualiza el costo promedio.
- Los movimientos de entrada se crean con el mismo formato y estructura que los movimientos manuales existentes.
- El redondeo de decimales para costos sigue las reglas existentes del sistema (2 decimales para visualización, precisión completa en cálculos).

## Out of Scope

- Modificación de la interfaz de usuario para capturar stock y costo inicial (se asume que ya existe o se manejará en otra feature).
- Migración de datos históricos de asignaciones que no tienen movimientos.
- Movimientos de ajuste o transferencia (solo se implementa entrada inicial).
- Notificaciones o alertas sobre las asignaciones realizadas.
