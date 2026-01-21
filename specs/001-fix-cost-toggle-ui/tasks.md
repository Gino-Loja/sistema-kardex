# Tasks: Corregir Toggle de Actualización Automática de Costo Promedio

**Input**: Design documents from `/specs/001-fix-cost-toggle-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests en la especificación.

**Organization**: Tasks organizadas por user story para implementación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos diferentes, sin dependencias)
- **[Story]**: User story al que pertenece la tarea (US1, US2)
- Rutas exactas de archivos en las descripciones

## Path Conventions

- **Single file**: `src/components/warehouses/warehouse-cost-mode-toggle.tsx`

---

## Phase 1: Setup (No Aplica)

**Purpose**: No se requiere setup adicional. La infraestructura ya existe.

*No hay tareas en esta fase - el proyecto ya está configurado.*

---

## Phase 2: Foundational (No Aplica)

**Purpose**: No hay prerrequisitos bloqueantes. Los componentes y API ya existen.

*No hay tareas en esta fase - las dependencias ya existen:*
- Componente Switch: `src/components/ui/switch.tsx` ✓
- API endpoint: `src/app/api/bodegas/[id]/route.ts` ✓
- Schema de validación: `src/lib/validations/masters.ts` ✓

---

## Phase 3: User Story 1 - Activar/Desactivar Actualización Automática de Costo (Priority: P1) 🎯 MVP

**Goal**: El administrador puede cambiar el estado del toggle y el cambio se guarda correctamente en el servidor sin errores NO_CHANGES.

**Independent Test**: Navegar a la página de detalle de una bodega, hacer clic en el switch, verificar que el cambio se guarda exitosamente.

### Implementation for User Story 1

- [x] T001 [US1] Eliminar componente Switch inline y agregar import de Switch de Radix UI en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- [x] T002 [US1] Corregir nombre del campo de `autoUpdateAverageCost` a `auto_update_average_cost` en el body del fetch en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- [x] T003 [US1] Actualizar uso del componente Switch con props `checked`, `onCheckedChange`, y `disabled` en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- [x] T004 [US1] Traducir mensajes de error de inglés a español en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`

**Checkpoint**: El toggle funciona correctamente - los cambios se guardan sin error NO_CHANGES.

---

## Phase 4: User Story 2 - Visualización Consistente del Toggle (Priority: P2)

**Goal**: El switch tiene el mismo diseño visual que otros switches en la aplicación y muestra "Actualizando..." durante el proceso.

**Independent Test**: Verificar visualmente que el switch tiene el estilo de Radix UI y muestra el texto de loading correcto.

### Implementation for User Story 2

- [x] T005 [US2] Cambiar texto del label de "Automatic Average Cost Update" a "Actualización Automática de Costo Promedio" en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- [x] T006 [US2] Cambiar texto de loading de "Updating..." a "Actualizando..." en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- [x] T007 [US2] Agregar `id="cost-mode-toggle"` al Switch para asociación correcta con el label en `src/components/warehouses/warehouse-cost-mode-toggle.tsx`

**Checkpoint**: El componente tiene apariencia consistente y textos en español.

---

## Phase 5: Polish & Verificación

**Purpose**: Verificación final de la implementación completa

- [x] T008 Ejecutar verificación manual según quickstart.md (navegar a bodega, cambiar toggle, verificar guardado)
- [x] T009 Verificar que no hay errores de TypeScript con `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No aplica - proyecto ya configurado
- **Foundational (Phase 2)**: No aplica - dependencias ya existen
- **User Story 1 (Phase 3)**: Puede comenzar inmediatamente
- **User Story 2 (Phase 4)**: Puede comenzar inmediatamente (independiente de US1)
- **Polish (Phase 5)**: Depende de US1 y US2 completados

### User Story Dependencies

- **User Story 1 (P1)**: Sin dependencias - funcionalidad core del toggle
- **User Story 2 (P2)**: Sin dependencias - cambios visuales y de texto

### Within Each User Story

- T001-T004 son cambios en el mismo archivo pero en diferentes secciones
- T005-T007 son cambios en el mismo archivo pero en diferentes secciones

### Parallel Opportunities

Dado que todas las tareas modifican el mismo archivo, se recomienda ejecutar secuencialmente para evitar conflictos. Sin embargo, las user stories son conceptualmente independientes.

**Opción 1**: Ejecutar todas las tareas en orden (T001 → T009)
**Opción 2**: Combinar T001-T007 en una única edición del archivo

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar T001-T004 (US1)
2. **VALIDAR**: Probar que el toggle guarda correctamente
3. Si funciona, continuar con US2

### Recomendación: Ejecución Única

Dado que todos los cambios son en un único archivo y son simples:

1. Aplicar todos los cambios (T001-T007) en una sola edición
2. Ejecutar verificación (T008-T009)
3. Commit único con todos los cambios

---

## Notes

- Todas las tareas modifican el mismo archivo: `src/components/warehouses/warehouse-cost-mode-toggle.tsx`
- El código final esperado está documentado en `quickstart.md`
- No se requieren migraciones de base de datos
- No se crean archivos nuevos
