# Research: Gestión de Movimientos CRUD

**Feature**: 001-movements-crud
**Date**: 2026-01-14

## Technical Decisions

### 1. Form State Management

**Decision**: Use useState pattern (same as existing forms)
**Rationale**: The codebase consistently uses useState for form state despite having react-hook-form installed. Maintaining consistency is more important than switching patterns.
**Alternatives considered**:
- react-hook-form: Already in package.json but not used in any existing form
- Formik: Not installed, would add dependency

### 2. Dynamic Line Items Pattern

**Decision**: Array state with add/remove functions
**Rationale**: Similar pattern already used in `WarehouseItemAssignment` component for batch operations. State array with index-based operations is straightforward.
**Alternatives considered**:
- useFieldArray from react-hook-form: Would require form library migration
- Separate modal for adding items: More complex UX, unnecessary for this use case

### 3. API Route Structure

**Decision**: Follow existing `/api/[entity]/route.ts` + `/api/[entity]/[id]/route.ts` pattern
**Rationale**: All CRUD entities (items, categories, bodegas, terceros, users) follow this exact pattern. Consistency aids maintainability.
**Alternatives considered**:
- Server Actions only: Existing pattern prefers API routes for CRUD
- GraphQL: Not used in project

### 4. Stock Validation Location

**Decision**: Server-side validation in API route
**Rationale**: Stock validation requires database queries. Client-side would require extra API calls and could have race conditions.
**Alternatives considered**:
- Client-side pre-validation: Would need separate stock check endpoint
- Form-level async validation: react-hook-form pattern, not compatible with current approach

### 5. Conditional Field Visibility

**Decision**: React conditional rendering with useEffect cleanup
**Rationale**: Simple boolean logic based on `tipo` value. UserForm already demonstrates this pattern for mode-specific fields.
**Alternatives considered**:
- CSS display:none: Bad for accessibility and form state
- Separate forms per tipo: Code duplication

### 6. Permission Model

**Decision**: Use existing `movements:write` permission
**Rationale**: Permission already defined in `roles.ts`. Both admin and bodeguero roles have this permission.
**Alternatives considered**:
- New granular permissions: Unnecessary complexity for MVP
- Role-based only: Less flexible than permission-based

## Existing Code Reuse

### Repositories (from exploration)
- `movimientosRepository`: Already handles CRUD for movimientos table
- `itemBodegasRepository`: Provides stock level queries

### Schemas (from exploration)
- `movimientoTipoSchema`: Validates movement type enum
- `movimientoDetalleSchema`: Validates line items
- `movimientoCreateSchema`: Full movement validation with superRefine

### Services (from exploration)
- `createMovementsService`: Has publicarMovimiento, anularMovimiento
- `inventoryValuationService`: Has weighted average cost logic

## Data Model Confirmation

### Existing Tables
```
movimientos:
- id (uuid, PK)
- tipo (text: entrada|salida|transferencia|ajuste)
- estado (text: borrador|publicado|anulado)
- fecha (timestamp)
- bodegaOrigenId (uuid, FK nullable)
- bodegaDestinoId (uuid, FK nullable)
- terceroId (uuid, FK nullable)
- usuarioId (uuid, FK required)
- observacion (text nullable)
- creadoEn, actualizadoEn (timestamps)

detalleMovimientos:
- id (uuid, PK)
- movimientoId (uuid, FK)
- itemId (uuid, FK)
- cantidad (numeric)
- costoUnitario (numeric nullable)
- costoTotal (numeric nullable)
```

### No Schema Changes Required
The existing schema fully supports the CRUD requirements. No migrations needed.

## UI Component Mapping

| Spec Requirement | Existing Component | New Component |
|------------------|-------------------|---------------|
| Item selector | Combobox pattern from WarehouseItemAssignment | Adapt for line items |
| Bodega dropdown | Native select pattern from ItemForm | Reuse pattern |
| Tercero dropdown | Native select pattern | Reuse pattern |
| Date picker | HTML date input | Standard pattern |
| Dynamic rows | Array state + map render | New implementation |
| Delete modal | CategoryDeleteModal, ItemDeleteModal | MovementDeleteModal |
| Filters | ItemFilters, ThirdPartyFilters | MovementFilters |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Complex form state | Break into smaller state pieces; test each independently |
| Stock validation race conditions | Validate server-side; use transactions |
| Type switching loses data | Confirm with user before clearing bodega selections |
| Large item lists | Paginate item selector; implement search |
