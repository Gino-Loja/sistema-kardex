# Feature Specification: Sistema Kardex NIIF

**Feature Branch**: `001-kardex-inventory`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: User description: "Sistema de gestion de inventario Kardex alineado a NIIF (NIC 2) para Maquirenthal S.A.S. Incluye autenticacion con roles Admin/Bodeguero, dashboard, maestros de datos, movimientos con flujo de estados, valorizacion automatica, reportes, e importacion/exportacion."

## Clarifications

### Session 2026-01-04

- Q: Politica de respaldos? - A: Respaldo diario automatico con retencion de 30 dias.

- Q: Respuesta ante duplicados bloqueados? - A: Rechazar con mensaje claro y sugerir revisar movimientos recientes.

- Q: Como se gestionan ajustes de inventario? - A: Ajustes son un tipo de movimiento con autorizacion Admin y motivo obligatorio.

- Q: Autorizacion de saldos negativos? - A: Solo Admin puede autorizar saldo negativo al publicar, con motivo obligatorio y registro en bitacora.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar movimientos con valorizacion (Priority: P1)

Como Bodeguero, quiero registrar entradas, salidas y transferencias con validaciones
para mantener el Kardex actualizado y el costo promedio ponderado correcto.

**Why this priority**: Es la operacion principal del control de inventarios y la valorizacion NIC 2.

**Independent Test**: Se puede probar registrando una entrada, una salida y una transferencia
verificando saldos, costos y trazabilidad.

**Acceptance Scenarios**:

1. **Given** un material activo con stock disponible, **When** registro una salida,
   **Then** el sistema valida stock y aplica el costo promedio vigente.
2. **Given** una transferencia entre bodegas, **When** la publico,
   **Then** se registran salida origen y entrada destino enlazadas.

---

### User Story 2 - Consultar dashboard e indicadores (Priority: P2)

Como Administrador o Bodeguero, quiero ver un dashboard con existencias, valorizacion
y alertas para tomar decisiones rapidas.

**Why this priority**: Ofrece visibilidad inmediata y reduce riesgos de desabastecimiento.

**Independent Test**: Se puede probar con inventario cargado y verificar que se muestren
existencias, alertas de minimo/maximo y ultimos movimientos.

**Acceptance Scenarios**:

1. **Given** items con stock minimo configurado, **When** el stock cae bajo el minimo,
   **Then** el dashboard muestra alerta de stock critico.
2. **Given** movimientos recientes, **When** accedo al dashboard,
   **Then** veo los ultimos movimientos y un indicador de rotacion.

---

### User Story 3 - Gestionar maestros de datos (Priority: P2)

Como Administrador, quiero administrar items, bodegas y terceros para asegurar datos
maestros consistentes.

**Why this priority**: Es necesario para operar movimientos, reportes y valorizacion.

**Independent Test**: Se puede probar creando un item, una bodega y un proveedor,
verificando que quedan disponibles para movimientos.

**Acceptance Scenarios**:

1. **Given** un Admin autenticado, **When** crea un item con unidad y categoria,
   **Then** el item queda activo y disponible.
2. **Given** una bodega configurada con min/max por item, **When** se consulta el item,
   **Then** se muestran sus limites de stock.

---

### User Story 4 - Reportes Kardex y exportacion (Priority: P3)

Como Administrador o Bodeguero, quiero generar reportes Kardex y exportarlos a CSV
para auditoria y analisis.

**Why this priority**: Permite control contable y respaldo documental.

**Independent Test**: Se puede probar generando un reporte por rango de fechas y
exportandolo a CSV.

**Acceptance Scenarios**:

1. **Given** movimientos en un periodo, **When** genero Kardex por item,
   **Then** veo entradas, salidas, saldos fisicos y valorizados.
2. **Given** un reporte generado, **When** exporto a CSV,
   **Then** obtengo el archivo con el mismo contenido del reporte.

---

### User Story 5 - Gestionar usuarios y roles (Priority: P3)

Como Administrador, quiero crear usuarios con roles (Admin/Bodeguero)
para asegurar el control de acceso.

**Why this priority**: Garantiza seguridad y cumplimiento de permisos.

**Independent Test**: Se puede probar creando un Bodeguero y verificando permisos.

**Acceptance Scenarios**:

1. **Given** un Admin autenticado, **When** crea un usuario Bodeguero,
   **Then** el usuario puede iniciar sesion con permisos limitados.
2. **Given** un usuario Bodeguero autenticado, **When** intenta acceder a configuracion,
   **Then** el acceso es denegado.

---

### User Story 6 - Importar catalogos (Priority: P3)

Como Administrador, quiero importar items desde CSV y exportar catalogos
para agilizar la carga inicial y mantenimiento.

**Why this priority**: Reduce el tiempo de puesta en marcha.

**Independent Test**: Se puede probar importando un CSV valido y verificando los items.

**Acceptance Scenarios**:

1. **Given** un CSV con items validos, **When** lo importo,
   **Then** los items quedan creados o actualizados.
2. **Given** items existentes, **When** exporto el catalogo,
   **Then** obtengo un CSV con codigo, descripcion y estado.

---

### Edge Cases

- Que ocurre si se intenta registrar una salida con stock insuficiente?
- Como se manejan movimientos duplicados exactos (item, fecha, tipo, cantidad)?
- Que ocurre si se solicita un reporte para un periodo sin movimientos?
- Que ocurre si se intenta editar un movimiento ya publicado?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST autenticar usuarios y permitir recuperacion de contrasena.
- **FR-002**: El sistema MUST aplicar permisos por rol (Admin, Bodeguero) en cada operacion.
- **FR-003**: El Admin MUST gestionar usuarios, roles y parametros del sistema.
- **FR-004**: El Admin MUST gestionar maestros de items, bodegas y terceros.
- **FR-005**: Los usuarios MUST registrar movimientos de entrada, salida y transferencia.
- **FR-006**: El sistema MUST validar stock disponible antes de salidas.
- **FR-007**: El sistema MUST aplicar flujo de estados Borrador -> Publicado -> Anulado.
- **FR-008**: Movimientos publicados MUST ser inmutables y solo anulables por Admin.
- **FR-009**: El sistema MUST calcular costo promedio ponderado tras cada entrada.
- **FR-010**: El sistema MUST aplicar el costo promedio vigente en cada salida.
- **FR-011**: El sistema MUST mantener Kardex historico (fisico y valorizado) por item.
- **FR-012**: Los usuarios MUST generar reportes Kardex por rango de fechas.
- **FR-013**: El sistema MUST permitir exportacion de reportes a CSV.
- **FR-014**: El sistema MUST mostrar dashboard con existencias, valorizacion, alertas
  de stock critico, ultimos movimientos e indicadores de rotacion.
- **FR-015**: El Admin MUST importar items desde CSV y exportar catalogos.
- **FR-016**: El sistema MUST registrar bitacoras de auditoria inmutables.
- **FR-017**: El sistema MUST permitir consulta y busqueda de movimientos por item y periodo.
- **FR-018**: El sistema MUST impedir saldos negativos salvo autorizacion explicita del Admin.\r\n- **FR-019**: Si se autoriza saldo negativo, MUST requerir motivo obligatorio y registrar evento en bitacora.\r\n- **FR-020**: El sistema MUST bloquear movimientos duplicados exactos (item, fecha, tipo, cantidad).\r\n- **FR-021**: Los ajustes de inventario MUST requerir autorizacion Admin y motivo obligatorio.\r\n- **FR-022**: Al bloquear duplicados, el sistema MUST mostrar un mensaje claro y sugerir revisar movimientos recientes.

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

### Non-Functional Requirements (Operational)

- **NFR-OPS-001**: Consultas de inventario MUST responder en menos de 2 segundos
  en escenarios normales de operacion.
- **NFR-OPS-002**: El sistema MUST soportar al menos 100 movimientos diarios.
- **NFR-OPS-003**: El sistema MUST realizar respaldo automatico de datos.
- **NFR-OPS-004**: La interfaz MUST ser usable en tablets.\r\n- **NFR-OPS-005**: El sistema MUST realizar respaldo diario con retencion de 30 dias.

### Key Entities *(include if feature involves data)*

- **Usuario**: Persona con acceso al sistema, asociada a un Rol.
- **Rol**: Define permisos (Admin, Bodeguero).
- **Item**: Producto o material con codigo, unidad, categoria y estado.
- **Bodega**: Ubicacion de almacenamiento con limites min/max por item.
- **Tercero**: Proveedor o cliente con informacion de contacto.
- **MovimientoInventario**: Entrada, salida o transferencia con estado y trazabilidad.
- **KardexRegistro**: Saldo fisico y valorizado por item y periodo.
- **BitacoraAuditoria**: Registro inmutable de operaciones criticas.

### Assumptions

- La empresa opera con una unica moneda y una unica organizacion.
- El Admin configura parametros iniciales de maestros antes de operar movimientos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% de usuarios completan el registro de un movimiento en menos de 2 minutos.
- **SC-002**: Consultas de inventario devuelven resultados en menos de 2 segundos
  en el 95% de los casos.
- **SC-003**: Reportes Kardex mensuales se generan en menos de 1 minuto para 10.000 movimientos.
- **SC-004**: Diferencias entre inventario fisico y contable se reducen al menos 50% en 3 meses.
- **SC-005**: 95% de movimientos quedan trazables con usuario, fecha y motivo registrado.





