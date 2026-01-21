# Quickstart - Gestion de bodegas

## Objetivo

Validar el flujo de creacion, edicion, consulta y asignacion de items a bodegas.

## Prerequisitos

- Acceso con rol Admin y Bodeguero.
- Items existentes en el catalogo.

## Flujo rapido (UI)

1. Inicia sesion como Admin.
2. Crea una bodega con identificacion, nombre y estado.
3. Edita la bodega y confirma que los cambios se reflejan en el detalle.
4. Inicia sesion como Bodeguero.
5. Abre la bodega y asigna uno o mas items.
6. Verifica que los items asignados aparecen en el detalle.

## Flujo rapido (API)

1. POST `/api/bodegas` con identificacion y nombre.
2. PATCH `/api/bodegas/{bodegaId}` para actualizar nombre o estado.
3. GET `/api/bodegas/{bodegaId}` para ver detalles.
4. POST `/api/bodegas/{bodegaId}/items` con lista de itemIds.
5. GET `/api/bodegas/{bodegaId}/items` para confirmar asignaciones.

## Resultados esperados

- La bodega creada aparece en la lista.
- La edicion actualiza datos visibles en el detalle.
- Las asignaciones se reflejan sin generar movimientos de inventario.
- Solo Admin puede crear o editar bodegas; Admin y Bodeguero pueden asignar items.
- Las asignaciones fallan si el item ya estaba asignado o la bodega esta inactiva.
