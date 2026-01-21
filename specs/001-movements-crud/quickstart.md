# Quickstart: Gestión de Movimientos CRUD

**Feature**: 001-movements-crud
**Date**: 2026-01-14

## Prerequisites

1. PostgreSQL running with sistema-kardex database
2. Node.js 20.x installed
3. Dependencies installed: `npm install`
4. Environment variables configured (`.env`)
5. Database migrations applied: `npm run db:migrate`

## Development Setup

```bash
# Start development server
npm run dev

# Access the app
open http://localhost:3000
```

## Key URLs

| Action | URL |
|--------|-----|
| List movements | http://localhost:3000/movements |
| Create movement | http://localhost:3000/movements/create |
| View movement | http://localhost:3000/movements/{id} |
| Edit movement | http://localhost:3000/movements/{id}/edit |

## Testing the Feature

### 1. Create an Entry Movement (Entrada)

1. Navigate to `/movements/create`
2. Select "Entrada" as type
3. Verify only "Bodega Destino" field is visible
4. Add at least one item with quantity and cost
5. Select destination warehouse
6. Click "Guardar Movimiento"
7. Verify redirect to list and movement appears

### 2. Create an Exit Movement (Salida)

1. Navigate to `/movements/create`
2. Select "Salida" as type
3. Verify only "Bodega Origen" field is visible
4. Add items (ensure sufficient stock in source warehouse)
5. Click "Guardar Movimiento"

### 3. Create a Transfer Movement (Transferencia)

1. Navigate to `/movements/create`
2. Select "Transferencia" as type
3. Verify BOTH bodega fields are visible
4. Select different origin and destination warehouses
5. Try selecting same warehouse for both - verify error
6. Complete with valid data and save

### 4. Edit a Draft Movement

1. From list, click on a movement with estado="borrador"
2. Navigate to edit page
3. Modify quantity or add/remove items
4. Save changes
5. Verify changes persisted

### 5. Delete a Draft Movement

1. From detail page of a borrador movement
2. Click delete button
3. Confirm in modal
4. Verify movement removed from list

### 6. Verify Edit/Delete Blocked for Published

1. Publish a movement (via existing flow)
2. Try to access edit page - should be blocked
3. Try to delete - should show error

## API Testing (curl)

```bash
# List movements
curl http://localhost:3000/api/movements

# Create movement
curl -X POST http://localhost:3000/api/movements \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "entrada",
    "fecha": "2026-01-14T10:00:00Z",
    "bodegaDestinoId": "uuid-here",
    "detalles": [
      { "itemId": "uuid-here", "cantidad": 10, "costoUnitario": 100 }
    ]
  }'

# Get single movement
curl http://localhost:3000/api/movements/{id}

# Update movement
curl -X PATCH http://localhost:3000/api/movements/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "observacion": "Updated notes"
  }'

# Delete movement
curl -X DELETE http://localhost:3000/api/movements/{id}
```

## File Structure After Implementation

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── movements/
│   │       ├── page.tsx              # List page
│   │       ├── search-params.ts      # URL params
│   │       ├── create/
│   │       │   └── page.tsx          # Create page
│   │       └── [id]/
│   │           ├── page.tsx          # Detail page
│   │           └── edit/
│   │               └── page.tsx      # Edit page
│   └── api/
│       └── movements/
│           ├── route.ts              # GET + POST
│           └── [id]/
│               └── route.ts          # GET + PATCH + DELETE
├── components/
│   └── movements/
│       ├── movement-form.tsx         # Main form component
│       ├── movement-list-table.tsx   # Table display
│       ├── movement-delete-modal.tsx # Delete confirmation
│       └── movement-filters.tsx      # Filter controls
└── lib/
    ├── data/
    │   └── movements.ts              # Data access
    └── validators/
        └── movement.ts               # Zod schemas
```

## Common Issues

### "INSUFFICIENT_STOCK" error on salida/transferencia
- Ensure the source warehouse has enough stock for the item
- Check stock levels in warehouse detail page

### Cannot edit/delete movement
- Movement must be in "borrador" state
- Published or cancelled movements are read-only

### Bodega fields not showing
- Fields appear based on movement type selection
- Entrada: only destination
- Salida: only origin
- Transferencia: both

### Form validation errors
- At least one item line required
- Quantity must be positive
- For transferencia, origin ≠ destination
