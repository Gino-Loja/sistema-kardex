# Feature Specification: Corregir Toggle de Actualización Automática de Costo Promedio

**Feature Branch**: `001-fix-cost-toggle-ui`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Cambiar de componente en la sección 'Automatic Average Cost Update' y solucionar el error NO_CHANGES del API. Traducir al español."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Activar/Desactivar Actualización Automática de Costo (Priority: P1)

Como administrador de bodega, quiero poder activar o desactivar la actualización automática del costo promedio usando un switch visual moderno, para controlar cómo se calculan los costos de los productos en esa bodega.

**Why this priority**: Esta es la funcionalidad principal que el usuario necesita. Sin el toggle funcionando correctamente, no puede gestionar la configuración de costos de la bodega.

**Independent Test**: Se puede probar navegando a la página de detalle de una bodega, haciendo clic en el switch, y verificando que el cambio se guarda correctamente y se refleja en la interfaz.

**Acceptance Scenarios**:

1. **Given** un administrador está en la página de detalle de una bodega con el costo automático desactivado, **When** hace clic en el switch de "Actualización Automática de Costo Promedio", **Then** el switch cambia a estado activo, se guarda en el servidor, y muestra confirmación visual del cambio.
2. **Given** un administrador está en la página de detalle de una bodega con el costo automático activado, **When** hace clic en el switch, **Then** el switch cambia a estado inactivo y se guarda correctamente en el servidor.
3. **Given** un administrador hace clic en el switch, **When** ocurre un error de red o del servidor, **Then** el switch revierte a su estado anterior y muestra un mensaje de error apropiado.

---

### User Story 2 - Visualización Consistente del Toggle (Priority: P2)

Como usuario del sistema, quiero ver un componente switch visual consistente con el resto de la aplicación, para tener una experiencia de usuario coherente.

**Why this priority**: La apariencia visual es importante para la usabilidad pero no es crítica para la funcionalidad del sistema.

**Independent Test**: Se puede verificar visualmente que el switch tiene el mismo estilo que otros componentes switch en la aplicación.

**Acceptance Scenarios**:

1. **Given** un usuario navega a la página de detalle de bodega, **When** ve la sección de configuración de costos, **Then** el switch tiene el mismo diseño visual que otros switches en la aplicación.
2. **Given** el switch está siendo procesado, **When** el usuario lo observa, **Then** muestra un indicador de "Actualizando..." mientras se guarda el cambio.

---

### Edge Cases

- ¿Qué pasa si el usuario hace múltiples clics rápidos en el switch? El sistema debe ignorar clics adicionales mientras una actualización está en progreso.
- ¿Qué pasa si la sesión del usuario expira mientras intenta cambiar el toggle? El sistema debe mostrar un error de autenticación apropiado.
- ¿Qué pasa si el servidor está temporalmente no disponible? El switch debe revertir a su estado anterior y mostrar un mensaje de error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE usar el componente Switch existente en la aplicación en lugar de un checkbox básico para el toggle de actualización automática de costo.
- **FR-002**: El sistema DEBE enviar el campo con el nombre correcto (`auto_update_average_cost`) que espera el esquema de validación del backend.
- **FR-003**: El sistema DEBE mostrar el texto en español: "Actualización Automática de Costo Promedio" en lugar de "Automatic Average Cost Update".
- **FR-004**: El sistema DEBE mostrar "Actualizando..." mientras se procesa el cambio.
- **FR-005**: El sistema DEBE deshabilitar el switch mientras se está procesando una actualización para evitar clics múltiples.
- **FR-006**: El sistema DEBE revertir el estado visual del switch si ocurre un error al guardar.
- **FR-007**: El sistema DEBE mostrar un mensaje de error amigable cuando falla la actualización.
- **FR-008**: El sistema DEBE refrescar los datos de la página después de una actualización exitosa.

### Key Entities

- **Bodega**: Representa un almacén o bodega. Tiene el atributo `auto_update_average_cost` (booleano) que controla si el costo promedio se actualiza automáticamente con los movimientos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede cambiar el estado del toggle de actualización automática de costo en menos de 3 segundos.
- **SC-002**: El 100% de los intentos de cambio de toggle con conectividad normal se guardan exitosamente (sin errores NO_CHANGES).
- **SC-003**: El componente switch es visualmente idéntico a otros switches en la aplicación.
- **SC-004**: Los textos de la interfaz aparecen en español para esta sección.
