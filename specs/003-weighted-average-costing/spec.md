# Feature Specification: Método de Valoración Promedio Ponderado

**Feature Branch**: `003-weighted-average-costing`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Implementar método de valoración promedio ponderado para el sistema Kárdex, recalculando el costo unitario promedio en cada entrada y aplicándolo en salidas."

## Clarifications

### Session 2026-01-16

- Q: ¿En qué momento se recalcula el costo promedio? → A: Solo en movimientos de ENTRADA (compras). Las salidas usan el promedio actual sin recalcular.
- Q: ¿Cómo se manejan las devoluciones en venta (nos devuelven)? → A: Se registran como ENTRADA al costo promedio actual (sin recalcular).
- Q: ¿Cómo se manejan las devoluciones en compra (devolvemos al proveedor)? → A: Se registran como SALIDA al costo promedio actual (sin recalcular).
- Q: ¿El cálculo es por ítem o por ítem+bodega? → A: Por ítem+bodega (cada bodega tiene su propio costo promedio por ítem).
- Q: ¿Cuántos decimales para el costo promedio? → A: 4 decimales para precisión en cálculos (NUMERIC 14,4).
- Q: ¿Comportamiento del Kárdex con miles de movimientos? → A: Paginación con límite de 100 registros por página.
- Q: ¿Qué filtros debe soportar la vista Kárdex? → A: Rango de fechas + Bodega + Tipo de movimiento.
- Q: ¿Exportar vista Kárdex a formato externo? → A: Sí, exportar a CSV.
- Q: ¿Qué mostrar cuando ítem no tiene movimientos? → A: Mensaje "Sin movimientos" con opción de crear entrada inicial.
- Q: ¿Registrar log de auditoría para cambios de costo promedio? → A: Sí, registrar fecha, usuario, valor anterior y nuevo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar Entrada con Recálculo de Promedio (Priority: P1)

Como usuario del sistema de inventario, necesito que al registrar una compra (entrada) el sistema recalcule automáticamente el costo unitario promedio ponderado para reflejar el nuevo valor del inventario.

**Why this priority**: El recálculo en entradas es la operación fundamental del método promedio ponderado. Sin esto, no se puede mantener un costo promedio actualizado.

**Independent Test**: Se puede verificar creando un movimiento de entrada con 60 unidades a $510.00 sobre un inventario existente de 120 unidades a $500.00, confirmando que el nuevo costo promedio es $503.33.

**Acceptance Scenarios**:

1. **Given** existe stock de 120 unidades a costo promedio $500.00 (valor $60,000), **When** se registra entrada de 60 unidades a $510.00, **Then** el sistema calcula nuevo promedio: ($60,000 + $30,600) / (120 + 60) = **$503.33**.
2. **Given** existe stock de 180 unidades a $503.33, **When** se registra entrada de 80 unidades a $490.00, **Then** el nuevo promedio es ($90,600 + $39,200) / 260 = **$499.23**.
3. **Given** no existe stock previo del ítem en la bodega, **When** se registra la primera entrada de 100 unidades a $250.00, **Then** el costo promedio inicial es **$250.00**.

---

### User Story 2 - Registrar Salida al Costo Promedio Actual (Priority: P1)

Como usuario del sistema de inventario, necesito que al registrar una venta (salida) el sistema use el costo promedio actual sin recalcularlo, para reflejar correctamente el costo de la mercancía vendida.

**Why this priority**: Las salidas son la segunda operación fundamental. Deben valorarse al promedio actual para calcular correctamente el costo de ventas.

**Independent Test**: Se puede verificar creando una salida de 70 unidades cuando el costo promedio es $499.23, confirmando que el valor de salida es $34,946.10.

**Acceptance Scenarios**:

1. **Given** existe stock de 260 unidades a costo promedio $499.23, **When** se registra salida de 70 unidades, **Then** el valor de salida es 70 x $499.23 = **$34,946.10** y el promedio se mantiene en **$499.23**.
2. **Given** existe stock de 190 unidades a $499.23, **When** se registra salida de 80 unidades, **Then** la existencia final es 110 unidades con el mismo costo promedio **$499.23**.
3. **Given** se intenta registrar salida de 100 unidades pero solo hay 50 en stock, **When** se valida, **Then** el sistema rechaza con error "Stock insuficiente".

---

### User Story 3 - Registrar Devolución en Venta (Priority: P2)

Como usuario del sistema de inventario, necesito registrar devoluciones de clientes al costo promedio actual para mantener consistencia en la valoración sin distorsionar el promedio.

**Why this priority**: Las devoluciones en venta son frecuentes y deben reintegrar stock al mismo valor que se registró la salida original.

**Independent Test**: Se puede verificar registrando una devolución de 10 unidades cuando el promedio es $499.23, confirmando que el stock aumenta sin cambiar el costo promedio.

**Acceptance Scenarios**:

1. **Given** existe stock de 190 unidades a $499.23, **When** se registra devolución en venta de 10 unidades, **Then** el stock aumenta a 200 unidades y el costo promedio se mantiene en **$499.23**.
2. **Given** el costo promedio actual es $499.23, **When** se registra devolución de 10 unidades, **Then** el valor de la entrada es 10 x $499.23 = **$4,992.30**.

---

### User Story 4 - Registrar Devolución en Compra (Priority: P2)

Como usuario del sistema de inventario, necesito registrar devoluciones a proveedores al costo promedio actual para decrementar stock sin distorsionar el promedio ponderado.

**Why this priority**: Las devoluciones en compra permiten corregir pedidos sin afectar el cálculo del promedio.

**Independent Test**: Se puede verificar devolviendo 15 unidades cuando el promedio es $502.69, confirmando que el stock disminuye y el valor se descuenta correctamente.

**Acceptance Scenarios**:

1. **Given** existe stock de 240 unidades a $502.69 (valor $120,646.20), **When** se registra devolución en compra de 15 unidades, **Then** el stock disminuye a 225 y el valor es $120,646.20 - $7,540.35 = **$113,105.85**.
2. **Given** el costo promedio es $502.69, **When** se devuelven 15 unidades, **Then** el costo promedio se mantiene en **$502.69**.

---

### User Story 5 - Consultar Kárdex con Histórico de Costos (Priority: P2)

Como usuario del sistema, necesito ver el histórico de movimientos estilo Tarjeta Kárdex mostrando entradas, salidas y existencias con sus respectivos costos promedio.

**Why this priority**: La visualización tipo Kárdex es esencial para auditoría y análisis del inventario.

**Independent Test**: Se puede verificar consultando el Kárdex de un ítem y validando que muestra columnas de Entradas, Salidas y Existencias con cantidad, P/U y valor.

**Acceptance Scenarios**:

1. **Given** existen movimientos registrados para un ítem, **When** se consulta el Kárdex, **Then** se muestra tabla con columnas: Fecha, Detalle, N° Documento, Entradas (Cant/P.U./Valor), Salidas (Cant/P.U./Valor), Existencias (Cant/P.U./Valor).
2. **Given** se registró una entrada de compra, **When** se visualiza en el Kárdex, **Then** muestra el P/U de entrada en columna Entradas y el nuevo P/U promedio en columna Existencias.

---

### User Story 6 - Transferencia entre Bodegas al Costo Promedio (Priority: P3)

Como usuario del sistema, necesito transferir stock entre bodegas manteniendo el costo promedio de la bodega origen, aplicándolo como entrada en la bodega destino.

**Why this priority**: Las transferencias deben mantener trazabilidad del costo sin crear ganancia/pérdida ficticia.

**Independent Test**: Se puede verificar transfiriendo 50 unidades de Bodega A (promedio $100) a Bodega B (promedio $120), confirmando que Bodega B recalcula su promedio.

**Acceptance Scenarios**:

1. **Given** Bodega A tiene 100 unidades a $100 (promedio) y Bodega B tiene 50 unidades a $120 (promedio), **When** se transfieren 30 unidades de A a B, **Then** Bodega B recalcula: ($6,000 + $3,000) / (50 + 30) = **$112.50**.
2. **Given** se transfiere stock, **When** se registra el movimiento, **Then** la bodega origen registra salida y la bodega destino registra entrada (ambas al costo promedio de origen).

---

### Edge Cases

- **Inventario inicial con costo $0**: Se permite; la primera entrada establece el promedio.
- **Stock en cero y nueva entrada**: El nuevo costo de entrada se convierte en el promedio (no hay valor previo que promediar).
- **Salida/devolución sin stock suficiente**: Se rechaza con validación de stock insuficiente.
- **Decimales en cantidades fraccionarias**: Se usan 4 decimales (NUMERIC 14,4) para cantidad y costo.
- **Edición de movimiento publicado**: No se permite; solo borradores son editables.
- **Anulación de movimiento publicado**: Fuera del alcance de esta iteración (requiere recálculo retroactivo complejo).
- **Ítem sin movimientos en bodega**: Muestra mensaje "Sin movimientos" con opción de crear entrada inicial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEBE recalcular el costo promedio ponderado en cada movimiento de tipo ENTRADA (compra) usando la fórmula: `Nuevo P/U = (Valor Existencia + Valor Entrada) / (Cant. Existencia + Cant. Entrada)`
- **FR-002**: Sistema DEBE aplicar el costo promedio actual (sin recalcular) en movimientos de tipo SALIDA (venta)
- **FR-003**: Sistema DEBE aplicar el costo promedio actual (sin recalcular) en devoluciones de venta (entrada)
- **FR-004**: Sistema DEBE aplicar el costo promedio actual (sin recalcular) en devoluciones de compra (salida)
- **FR-005**: Sistema DEBE almacenar el costo promedio por combinación ítem+bodega en la tabla `itemBodegas`
- **FR-006**: Sistema DEBE registrar el costo unitario usado en cada línea del detalle de movimiento
- **FR-007**: Sistema DEBE calcular el valor total de cada línea como `cantidad x costoUnitario`
- **FR-008**: Sistema DEBE validar stock disponible antes de permitir salidas o devoluciones de compra
- **FR-009**: Sistema DEBE usar precisión de 4 decimales (NUMERIC 14,4) para costos y cantidades
- **FR-010**: Sistema DEBE actualizar `itemBodegas.costoPromedio` después de publicar un movimiento
- **FR-011**: Sistema DEBE mostrar vista Kárdex con histórico de movimientos mostrando Entradas, Salidas y Existencias, con paginación de 100 registros por página y filtros por rango de fechas, bodega y tipo de movimiento
- **FR-012**: Sistema DEBE permitir inventario inicial (primera entrada sin existencia previa)
- **FR-013**: Sistema DEBE manejar transferencias aplicando costo promedio de bodega origen como costo de entrada en bodega destino
- **FR-014**: Sistema DEBE permitir exportar la vista Kárdex a formato CSV
- **FR-015**: Sistema DEBE registrar log de auditoría cuando cambia el costo promedio, incluyendo fecha, usuario, valor anterior y valor nuevo

### Key Entities

- **ItemBodega**: Relación entre ítem y bodega. Atributos clave: `itemId`, `bodegaId`, `cantidad`, `costoPromedio`, `valorTotal`.
- **DetalleMovimiento**: Línea de movimiento. Atributos: `movimientoId`, `itemId`, `cantidad`, `costoUnitario` (P/U aplicado), `costoTotal`.
- **Movimiento**: Cabecera del movimiento. Atributos existentes + `subTipo` para distinguir devoluciones (compra, venta, devolucion_venta, devolucion_compra).
- **AuditoriaCostoPromedio**: Log de cambios en costo promedio. Atributos: `itemBodegaId`, `movimientoId`, `fecha`, `usuarioId`, `costoAnterior`, `costoNuevo`.

### Tipos de Movimiento para Promedio Ponderado

| Tipo          | SubTipo           | Afecta Stock      | Recalcula P/U | Fórmula Costo                                                 |
|---------------|-------------------|-------------------|---------------|---------------------------------------------------------------|
| entrada       | compra            | +Stock            | **SÍ**        | (ValorAnterior + ValorEntrada) / (CantAnterior + CantEntrada) |
| entrada       | devolucion_venta  | +Stock            | NO            | P/U Promedio Actual                                           |
| salida        | venta             | -Stock            | NO            | P/U Promedio Actual                                           |
| salida        | devolucion_compra | -Stock            | NO            | P/U Promedio Actual                                           |
| transferencia | -                 | -Origen, +Destino | SÍ (destino)  | P/U de Bodega Origen                                          |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de las entradas de compra recalculan correctamente el costo promedio ponderado según la fórmula establecida
- **SC-002**: 100% de las salidas y devoluciones usan el costo promedio actual sin modificarlo
- **SC-003**: Los cálculos del sistema coinciden con el ejemplo de referencia de la Tarjeta Kárdex (libro de contabilidad) con diferencia máxima de $0.01 por redondeo
- **SC-004**: La vista Kárdex muestra los 9 campos requeridos: Fecha, Detalle, N° Doc, y para cada columna (Entradas/Salidas/Existencias): Cantidad, P.U., Valor
- **SC-005**: El sistema rechaza 100% de las salidas que excedan el stock disponible mostrando mensaje de error claro
- **SC-006**: Las transferencias entre bodegas no generan ganancia/pérdida ficticia (suma de valores constante antes y después)
- **SC-007**: Los usuarios pueden consultar el Kárdex de cualquier ítem y ver el histórico completo de movimientos ordenado cronológicamente

## Assumptions

- El sistema ya cuenta con la relación `itemBodegas` para gestionar stock por bodega
- Los movimientos tienen estados (borrador, publicado, anulado) y solo los publicados afectan el costo promedio
- La anulación de movimientos publicados está fuera del alcance de esta iteración (requiere recálculo retroactivo)
- No se requiere soporte para otros métodos de valoración (FIFO, LIFO) en esta fase
- El costo de entrada puede ser $0 (ejemplo: donaciones)
- Se asume un solo tipo de moneda (sin conversiones de divisas)
- El usuario ya tiene permisos para gestionar movimientos de inventario
