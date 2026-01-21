# Implementation Plan: Gestión de Movimientos de Inventario (CRUD)

**Branch**: `001-movements-crud` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-movements-crud/spec.md`

## Summary

Implementar CRUD completo para movimientos de inventario con formulario dinámico que soporta múltiples líneas de ítems, campos de bodega condicionales según tipo de movimiento (entrada/salida/transferencia), y validación de stock. Se reutilizarán los patrones existentes del sistema (formularios con useState, API routes con Zod, server components para páginas).

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Drizzle ORM 0.41.0, Zod 4.3.5, better-auth 1.4.10
**Storage**: PostgreSQL (via Drizzle ORM) - tablas existentes: `movimientos`, `detalleMovimientos`
**Testing**: Manual testing via browser
**Target Platform**: Web application (localhost:3000)
**Project Type**: Next.js App Router (monolith)
**Performance Goals**: Formulario responde en <100ms, guardado en <2s
**Constraints**: Solo tipos entrada/salida/transferencia (ajuste excluido del alcance)
**Scale/Scope**: CRUD estándar, ~5 páginas nuevas, ~3 componentes nuevos

## Constitution Check

*GATE: Constitution template not configured - proceeding with standard patterns.*

✅ No violations detected - using established project patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-movements-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/app/(dashboard)/movements/
├── page.tsx                    # List page (EXISTS - needs update)
├── search-params.ts            # NEW: nuqs search params
├── create/
│   └── page.tsx                # NEW: Create movement page
└── [id]/
    ├── page.tsx                # NEW: Detail/view page
    └── edit/
        └── page.tsx            # NEW: Edit movement page

src/app/api/movements/
├── route.ts                    # NEW: GET (list) + POST (create)
└── [id]/
    └── route.ts                # NEW: GET + PATCH + DELETE

src/components/movements/
├── movement-form.tsx           # NEW: Form with dynamic line items
├── movement-list-table.tsx     # NEW: Table component
├── movement-delete-modal.tsx   # NEW: Delete confirmation
└── movement-filters.tsx        # NEW: Filter controls

src/lib/
├── validators/
│   └── movement.ts             # NEW: Zod schemas for API
├── data/
│   └── movements.ts            # NEW: Data access functions
└── validations/
    └── movements.ts            # EXISTS - extend if needed
```

**Structure Decision**: Follows existing CRUD pattern (items, categories, warehouses, users). Uses App Router with server components for pages, client components for forms.

## Implementation Approach

### Phase 1: API Layer

1. **Create API routes** following existing patterns:
   - `GET /api/movements` - List with pagination, filters (tipo, estado, fecha)
   - `POST /api/movements` - Create movement with details array
   - `GET /api/movements/[id]` - Get single movement with details
   - `PATCH /api/movements/[id]` - Update movement (only borrador state)
   - `DELETE /api/movements/[id]` - Delete movement (only borrador state)

2. **Validation schemas** (`src/lib/validators/movement.ts`):
   - `movementCreateSchema` - Full validation with conditional bodega rules
   - `movementPatchSchema` - Partial update validation
   - `movementListQuerySchema` - Query params validation

3. **Permission**: Use existing `movements:write` permission from roles.ts

### Phase 2: Data Layer

1. **Data functions** (`src/lib/data/movements.ts`):
   - `listMovements(query)` - Paginated list with filters
   - `getMovementById(id)` - Single movement with detalles
   - `createMovement(data)` - Insert movement + details (transaction)
   - `updateMovement(id, data)` - Update movement + details
   - `deleteMovement(id)` - Delete movement + cascade details

2. **Reuse existing**:
   - `movimientosRepository` for database operations
   - `detalleMovimientos` table for line items

### Phase 3: UI Components

1. **MovementForm** (`src/components/movements/movement-form.tsx`):
   - State-based form (useState pattern like ItemForm)
   - Dynamic line items (add/remove rows)
   - Conditional bodega fields based on tipo
   - Real-time total calculation (cantidad × costoUnitario)
   - Item search/select via combobox
   - Bodega select dropdowns
   - Tercero select dropdown
   - Date picker for fecha
   - Submit to API (POST/PATCH)

2. **MovementListTable** (`src/components/movements/movement-list-table.tsx`):
   - Display movements with tipo, estado, fecha, total
   - Link to detail/edit pages
   - Action menu (edit, delete)

3. **MovementDeleteModal** (`src/components/movements/movement-delete-modal.tsx`):
   - Confirmation dialog before delete
   - Only enabled for estado="borrador"

4. **MovementFilters** (`src/components/movements/movement-filters.tsx`):
   - Filter by tipo, estado, fecha range

### Phase 4: Pages

1. **List Page** (`/movements`):
   - Update existing page with filters, pagination
   - Add "Nuevo Movimiento" button
   - Use MovementListTable component

2. **Create Page** (`/movements/create`):
   - Render MovementForm with mode="create"
   - Permission check (movements:write)

3. **Detail Page** (`/movements/[id]`):
   - Display movement info read-only
   - Show line items table
   - Edit/Delete buttons (if borrador)

4. **Edit Page** (`/movements/[id]/edit`):
   - Fetch movement data
   - Render MovementForm with mode="edit"
   - Block if estado !== "borrador"

## Key Implementation Details

### Conditional Bodega Logic

```typescript
// In MovementForm
const showBodegaOrigen = tipo === "salida" || tipo === "transferencia"
const showBodegaDestino = tipo === "entrada" || tipo === "transferencia"

// Reset bodegas when tipo changes
useEffect(() => {
  if (tipo === "entrada") {
    setValues(prev => ({ ...prev, bodegaOrigenId: null }))
  } else if (tipo === "salida") {
    setValues(prev => ({ ...prev, bodegaDestinoId: null }))
  }
}, [tipo])
```

### Dynamic Line Items

```typescript
type LineItem = {
  itemId: string
  cantidad: number
  costoUnitario: number
}

const [detalles, setDetalles] = useState<LineItem[]>([
  { itemId: "", cantidad: 0, costoUnitario: 0 }
])

const addLine = () => {
  setDetalles(prev => [...prev, { itemId: "", cantidad: 0, costoUnitario: 0 }])
}

const removeLine = (index: number) => {
  if (detalles.length > 1) {
    setDetalles(prev => prev.filter((_, i) => i !== index))
  }
}
```

### Stock Validation (Salida/Transferencia)

```typescript
// In API route or form validation
if (tipo === "salida" || tipo === "transferencia") {
  for (const detalle of detalles) {
    const stock = await getStockByItemBodega(detalle.itemId, bodegaOrigenId)
    if (stock < detalle.cantidad) {
      throw new Error("INSUFFICIENT_STOCK")
    }
  }
}
```

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/app/(dashboard)/movements/page.tsx` | MODIFY | Add filters, pagination, create button |
| `src/lib/validations/movements.ts` | MODIFY | Ensure schemas cover CRUD needs |

## Files to Create

| File | Description |
|------|-------------|
| `src/app/api/movements/route.ts` | List + Create API |
| `src/app/api/movements/[id]/route.ts` | Get + Update + Delete API |
| `src/app/(dashboard)/movements/search-params.ts` | Search params config |
| `src/app/(dashboard)/movements/create/page.tsx` | Create page |
| `src/app/(dashboard)/movements/[id]/page.tsx` | Detail page |
| `src/app/(dashboard)/movements/[id]/edit/page.tsx` | Edit page |
| `src/components/movements/movement-form.tsx` | Form component |
| `src/components/movements/movement-list-table.tsx` | Table component |
| `src/components/movements/movement-delete-modal.tsx` | Delete modal |
| `src/components/movements/movement-filters.tsx` | Filter component |
| `src/lib/validators/movement.ts` | Zod validation schemas |
| `src/lib/data/movements.ts` | Data access layer |

## Verification

1. **Create Movement**:
   - Navigate to `/movements/create`
   - Select tipo "Entrada", add items, select bodega destino
   - Verify bodega origen is hidden
   - Save and verify redirect to list

2. **Conditional Fields**:
   - Change tipo to "Salida" → only bodega origen visible
   - Change tipo to "Transferencia" → both bodegas visible
   - Verify validation fails if same bodega for transferencia

3. **Multiple Line Items**:
   - Add 3 line items, verify totals calculate
   - Remove middle item, verify remaining items persist
   - Cannot remove last item

4. **Edit Movement**:
   - Edit a borrador movement → should work
   - Try to edit a publicado movement → should be blocked

5. **Delete Movement**:
   - Delete a borrador → confirmation shown, then deleted
   - Try to delete publicado → should be rejected

6. **Stock Validation**:
   - Create salida with quantity > available stock → error shown
   - Create salida with valid quantity → succeeds
