# Research: Mejoras UX Movimientos

**Feature**: 004-movement-ux-fixes
**Date**: 2026-01-16

## Research Tasks

### R1: Servicios existentes para transición de estados

**Question**: ¿Existen servicios de backend para publicar/anular movimientos?

**Finding**: Sí, existen en `src/lib/dal/services/movements.service.ts`:

```typescript
// publicarMovimiento(id: string) - Cambia estado borrador → publicado
// - Valida que el movimiento esté en estado "borrador"
// - Valida stock disponible para salidas/transferencias
// - Actualiza itemBodegas (stock + costo promedio)
// - Registra auditoría de cambio de costo promedio
// - Actualiza estado a "publicado"

// anularMovimiento(id: string) - Cambia estado publicado → anulado
// - Valida que el movimiento esté en estado "publicado"
// - Revierte cambios en itemBodegas (stock)
// - NO recalcula costo promedio retroactivamente (simplificación)
// - Actualiza estado a "anulado"
```

**Decision**: Reutilizar los servicios existentes. Solo necesitamos exponer endpoints HTTP y crear UI.

**Rationale**: Los servicios ya implementan toda la lógica de negocio (validaciones, transacciones, auditoría). Crear nuevos sería duplicación.

**Alternatives considered**:
- Server Actions directos: Rechazado porque ya existe un patrón de API Routes en el proyecto.

---

### R2: Obtención de costo promedio por ítem+bodega

**Question**: ¿Cómo obtener el costo promedio de un ítem en una bodega específica?

**Finding**: La tabla `itemBodegas` tiene el campo `costoPromedio`:

```typescript
// Tabla: item_bodegas
// Campos relevantes: itemId, bodegaId, cantidad, costoPromedio

// Repository existente: src/lib/dal/repositories/item-bodegas.repository.ts
// Método: getByItemAndBodega(itemId, bodegaId) - retorna registro completo
```

**Decision**: Crear función específica `getAverageCosts(bodegaId, itemIds[])` que retorne un mapa de costos para múltiples ítems en una sola query.

**Rationale**: El formulario puede tener múltiples líneas de detalle. Una query batch es más eficiente que N queries individuales.

**Alternatives considered**:
- Query individual por ítem: Rechazado por ineficiencia (N+1 problem).
- Cargar todos los costos al inicio: Rechazado porque puede haber miles de ítems.

---

### R3: Patrón de confirmación en UI

**Question**: ¿Qué patrón usar para confirmación de acciones destructivas (publicar/anular)?

**Finding**: El proyecto usa modales de confirmación con el patrón:

```typescript
// Componente existente: AlertDialog de @base-ui/react
// Patrón usado en: movement-delete-modal.tsx
// - Estado local para abrir/cerrar
// - Callback onConfirm async
// - Feedback visual durante loading
```

**Decision**: Usar `AlertDialog` siguiendo el patrón existente de `movement-delete-modal.tsx`.

**Rationale**: Consistencia con UI existente. El usuario ya está familiarizado con este patrón.

**Alternatives considered**:
- Toast con undo: Rechazado porque publicar/anular son acciones críticas que requieren confirmación explícita.
- Inline confirmation: Rechazado por espacio limitado en la vista de detalle.

---

### R4: Badge de estado visual

**Question**: ¿Qué estilos usar para los badges de estado?

**Finding**: El proyecto ya tiene badges en otros módulos. Colores definidos en spec:

```
Borrador: gris (neutral)
Publicado: verde (success)
Anulado: rojo (destructive)
```

**Decision**: Crear componente `MovementStatusBadge` con variantes usando class-variance-authority.

**Rationale**: Reutilizable en listado y detalle. Consistente con el sistema de diseño existente.

**Alternatives considered**:
- Badge inline sin componente: Rechazado por duplicación de estilos.

---

### R5: Validación de stock al abrir formulario de edición

**Question**: ¿Cómo implementar validación de stock al cargar el formulario?

**Finding**:
- La validación actual ocurre solo al publicar (`movements.service.ts`)
- El formulario carga datos del movimiento al montar (`useEffect`)
- Se puede agregar validación adicional comparando detalles vs stock actual

**Decision**: Agregar validación en el formulario que compare cada línea de detalle con el stock actual de `itemBodegas` y muestre advertencias inline.

**Rationale**: Feedback temprano al usuario. No bloquea la edición pero advierte sobre problemas potenciales.

**Alternatives considered**:
- Bloquear edición completamente: Rechazado por ser demasiado restrictivo.
- Solo validar al guardar: Rechazado porque el usuario descubriría el problema muy tarde.

---

## Summary of Decisions

| Area | Decision | Impact |
|------|----------|--------|
| Servicios backend | Reutilizar `publicarMovimiento()` y `anularMovimiento()` existentes | Bajo riesgo, código probado |
| Costo promedio | Nueva función batch `getAverageCosts(bodegaId, itemIds[])` | Eficiencia en formulario |
| UI Confirmación | Usar `AlertDialog` existente | Consistencia UX |
| Badge estado | Nuevo componente `MovementStatusBadge` con CVA | Reutilizable |
| Validación stock | Advertencias inline al cargar formulario | Mejor UX sin bloquear |

## Dependencies Confirmed

- `@base-ui/react` - AlertDialog para confirmaciones
- `class-variance-authority` - Variantes de badge
- `movements.service.ts` - Servicios publicar/anular existentes
- `item-bodegas.repository.ts` - Acceso a costos promedio

## Unknowns Resolved

Todos los "NEEDS CLARIFICATION" del Technical Context han sido resueltos:
- ✅ Servicios de backend existen y son reutilizables
- ✅ Costo promedio disponible en tabla `itemBodegas`
- ✅ Patrones de UI establecidos en el proyecto
- ✅ Validación de stock factible con datos existentes
