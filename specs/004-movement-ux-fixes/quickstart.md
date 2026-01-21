# Quickstart: Mejoras UX Movimientos

**Feature**: 004-movement-ux-fixes
**Date**: 2026-01-16

## Prerequisites

- Node.js 20.x
- PostgreSQL running con base de datos `sistema_kardex`
- Variables de entorno configuradas (`.env.local`)
- Dependencias instaladas (`npm install`)

## Development Setup

```bash
# 1. Clonar y cambiar a la rama
git checkout 004-movement-ux-fixes

# 2. Instalar dependencias (si no están instaladas)
npm install

# 3. Verificar que la base de datos esté actualizada
npm run db:push

# 4. Iniciar servidor de desarrollo
npm run dev
```

## Feature Overview

Esta feature implementa dos mejoras:

### 1. Gestión de Estados desde UI

**Archivos a modificar/crear**:
- `src/app/api/movements/[id]/publish/route.ts` - Endpoint publicar
- `src/app/api/movements/[id]/void/route.ts` - Endpoint anular
- `src/app/(dashboard)/movements/[id]/page.tsx` - Vista detalle con botones
- `src/components/movements/movement-status-badge.tsx` - Badge estado
- `src/components/movements/movement-action-buttons.tsx` - Botones acción

**Flujo de trabajo**:
1. Usuario accede a `/movements/{id}` (vista detalle)
2. Si estado="borrador" → mostrar botón "Publicar"
3. Si estado="publicado" → mostrar botón "Anular"
4. Click en botón → modal confirmación → POST a endpoint → actualizar UI

### 2. Costo Automático en Salidas

**Archivos a modificar/crear**:
- `src/app/api/item-bodegas/average-costs/route.ts` - Endpoint costos
- `src/components/movements/movement-form.tsx` - Lógica campo costo
- `src/hooks/movements/use-average-cost.ts` - Hook para obtener costos

**Flujo de trabajo**:
1. Usuario crea/edita movimiento tipo "Salida"
2. Al seleccionar ítem → fetch costo promedio de la bodega
3. Campo costoUnitario se llena automáticamente (readonly)
4. Si tipo cambia a "Entrada" → campo se habilita para edición

## Implementation Order

### Fase 1: Backend (API Routes)

```bash
# Crear endpoints de estado
src/app/api/movements/[id]/publish/route.ts
src/app/api/movements/[id]/void/route.ts

# Crear endpoint de costos promedio
src/app/api/item-bodegas/average-costs/route.ts
```

### Fase 2: Componentes Compartidos

```bash
# Badge de estado reutilizable
src/components/movements/movement-status-badge.tsx

# Botones de acción con modales
src/components/movements/movement-action-buttons.tsx
```

### Fase 3: Integración en Páginas

```bash
# Vista detalle con botones
src/app/(dashboard)/movements/[id]/page.tsx

# Listado con badges
src/components/movements/movement-list-table.tsx
```

### Fase 4: Formulario con Costo Automático

```bash
# Hook para costos
src/hooks/movements/use-average-cost.ts

# Modificar formulario
src/components/movements/movement-form.tsx
```

## Testing

### Manual Testing

1. **Publicar movimiento**:
   - Crear movimiento de entrada en borrador
   - Ir a vista detalle → verificar botón "Publicar"
   - Click → confirmar → verificar estado cambia a "Publicado"
   - Verificar stock actualizado en itemBodegas

2. **Anular movimiento**:
   - Con movimiento publicado, ir a detalle
   - Verificar botón "Anular" visible
   - Click → confirmar → verificar estado cambia a "Anulado"

3. **Costo automático en salida**:
   - Crear movimiento tipo "Salida"
   - Seleccionar bodega origen
   - Agregar ítem → verificar costo se llena automáticamente
   - Verificar campo está deshabilitado
   - Cambiar tipo a "Entrada" → verificar campo se habilita

### Automated Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests e2e
npm run test:e2e
```

## Key Files Reference

| Archivo | Propósito |
|---------|-----------|
| `src/lib/dal/services/movements.service.ts` | Servicios existentes publicar/anular |
| `src/lib/dal/repositories/item-bodegas.repository.ts` | Acceso a costos promedio |
| `src/lib/drizzle/schemas/movimientos.ts` | Schema tabla movimientos |
| `src/lib/validators/movement.ts` | Validaciones Zod |

## Troubleshooting

### Error: "Solo se pueden publicar movimientos en borrador"
- El movimiento ya fue publicado o anulado
- Verificar estado actual con GET /api/movements/{id}

### Error: "Stock insuficiente"
- El stock cambió desde que se creó el movimiento
- Verificar stock actual en /api/item-bodegas/average-costs
- Ajustar cantidad en el movimiento antes de publicar

### Costo promedio muestra $0
- El ítem no tiene entradas previas en esa bodega
- Es esperado para ítems nuevos (advertencia visual)
