# Implementation Plan: Corregir Toggle de Actualización Automática de Costo Promedio

**Branch**: `001-fix-cost-toggle-ui` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-cost-toggle-ui/spec.md`

## Summary

Corregir el componente `WarehouseCostModeToggle` para:
1. Usar el componente Switch de Radix UI existente en lugar del checkbox HTML básico
2. Enviar el campo con el nombre correcto (`auto_update_average_cost`) al API
3. Traducir los textos de la interfaz al español
4. Mejorar la experiencia de usuario deshabilitando el switch durante actualizaciones

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Radix UI 1.4.3, Drizzle ORM 0.41.0, Zod 4.3.5
**Storage**: PostgreSQL (via Drizzle ORM)
**Testing**: Vitest + Testing Library
**Target Platform**: Web application (browser)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: < 3 segundos para cambio de toggle
**Constraints**: Usar componentes UI existentes, mantener consistencia visual
**Scale/Scope**: Cambio localizado en un único componente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

La constitución del proyecto está en formato de plantilla sin principios definidos. Se aplicarán las mejores prácticas estándar:

| Principle | Status | Notes |
|-----------|--------|-------|
| Reutilización de componentes | ✅ PASS | Usar Switch existente de `@/components/ui/switch` |
| Consistencia de código | ✅ PASS | Seguir patrones existentes del proyecto |
| Manejo de errores | ✅ PASS | Implementar revert de estado y mensajes de error |

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-cost-toggle-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   └── switch.tsx           # Componente Switch existente (Radix UI)
│   └── warehouses/
│       └── warehouse-cost-mode-toggle.tsx  # Archivo a modificar
├── app/
│   └── api/
│       └── bodegas/
│           └── [id]/
│               └── route.ts     # API endpoint existente
└── lib/
    └── validations/
        └── masters.ts           # Schema de validación (auto_update_average_cost)
```

**Structure Decision**: Modificación de componente existente. No se crean nuevos archivos, solo se actualiza `warehouse-cost-mode-toggle.tsx`.

## Complexity Tracking

No hay violaciones de la constitución. El cambio es simple y localizado.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
