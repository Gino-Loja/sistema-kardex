# API Contracts: Mejoras UX Movimientos

**Feature**: 004-movement-ux-fixes
**Date**: 2026-01-16

## New Endpoints

### POST /api/movements/[id]/publish

Publica un movimiento (cambia estado de "borrador" a "publicado").

**Request**:
```http
POST /api/movements/{id}/publish
Authorization: Bearer {token}
Content-Type: application/json

{}
```

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "estado": "publicado",
    "updatedAt": "2026-01-16T10:30:00Z"
  }
}
```

**Response Errors**:

| Status | Code | Message | When |
|--------|------|---------|------|
| 401 | UNAUTHENTICATED | "Sesión no válida" | Token inválido/expirado |
| 404 | NOT_FOUND | "Movimiento no encontrado" | ID no existe |
| 409 | NOT_EDITABLE | "Solo se pueden publicar movimientos en borrador" | estado !== "borrador" |
| 422 | STOCK_INSUFFICIENT | "Stock insuficiente para {itemName}" | Stock < cantidad requerida |

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "STOCK_INSUFFICIENT",
    "message": "Stock insuficiente para Láminas de acero",
    "details": {
      "itemId": "uuid",
      "itemName": "Láminas de acero",
      "required": 100,
      "available": 50
    }
  }
}
```

---

### POST /api/movements/[id]/void

Anula un movimiento publicado (cambia estado de "publicado" a "anulado").

**Request**:
```http
POST /api/movements/{id}/void
Authorization: Bearer {token}
Content-Type: application/json

{}
```

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "estado": "anulado",
    "updatedAt": "2026-01-16T10:30:00Z"
  }
}
```

**Response Errors**:

| Status | Code | Message | When |
|--------|------|---------|------|
| 401 | UNAUTHENTICATED | "Sesión no válida" | Token inválido/expirado |
| 404 | NOT_FOUND | "Movimiento no encontrado" | ID no existe |
| 409 | NOT_VOIDABLE | "Solo se pueden anular movimientos publicados" | estado !== "publicado" |

---

### GET /api/item-bodegas/average-costs

Obtiene los costos promedio de múltiples ítems en una bodega específica.

**Request**:
```http
GET /api/item-bodegas/average-costs?bodegaId={bodegaId}&itemIds={id1,id2,id3}
Authorization: Bearer {token}
```

**Query Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| bodegaId | uuid | Yes | ID de la bodega |
| itemIds | string | Yes | IDs de ítems separados por coma |

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "bodegaId": "uuid",
    "costs": {
      "item-uuid-1": {
        "costoPromedio": 499.2300,
        "cantidad": 150,
        "valorTotal": 74884.50
      },
      "item-uuid-2": {
        "costoPromedio": 120.5000,
        "cantidad": 80,
        "valorTotal": 9640.00
      },
      "item-uuid-3": {
        "costoPromedio": 0,
        "cantidad": 0,
        "valorTotal": 0
      }
    }
  }
}
```

**Response Errors**:

| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | VALIDATION_ERROR | "bodegaId es requerido" | Parámetro faltante |
| 400 | VALIDATION_ERROR | "itemIds es requerido" | Parámetro faltante |
| 401 | UNAUTHENTICATED | "Sesión no válida" | Token inválido/expirado |
| 404 | NOT_FOUND | "Bodega no encontrada" | bodegaId no existe |

---

## Modified Endpoints

### GET /api/movements/[id]

**Sin cambios en el contrato**. El campo `estado` ya existe en la respuesta.

Response incluye:
```json
{
  "id": "uuid",
  "tipo": "salida",
  "estado": "borrador",  // ← Ya incluido, usado por UI para mostrar botones
  ...
}
```

---

### GET /api/movements

**Sin cambios en el contrato**. El campo `estado` ya existe en cada item del listado.

Response incluye:
```json
{
  "items": [
    {
      "id": "uuid",
      "tipo": "entrada",
      "estado": "publicado",  // ← Ya incluido, usado por UI para badge
      ...
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

---

## TypeScript Types

```typescript
// Request/Response types for new endpoints

// POST /api/movements/[id]/publish
interface PublishMovementResponse {
  success: true;
  data: {
    id: string;
    estado: "publicado";
    updatedAt: string;
  };
}

// POST /api/movements/[id]/void
interface VoidMovementResponse {
  success: true;
  data: {
    id: string;
    estado: "anulado";
    updatedAt: string;
  };
}

// GET /api/item-bodegas/average-costs
interface AverageCostsResponse {
  success: true;
  data: {
    bodegaId: string;
    costs: Record<string, {
      costoPromedio: number;
      cantidad: number;
      valorTotal: number;
    }>;
  };
}

// Error response (all endpoints)
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```
