# API Contracts: Refine Item UI

This feature does not introduce new API endpoints or payload fields.
The UI relies on existing item list and item detail data to render the table,
actions, and detail view.

## Required fields from existing item detail

- id or codigo
- nombre
- categoria
- unidadDeMedida
- stockActual o disponibilidad
- costo
- precioVenta
- fechaUltimaActualizacion
- imagenPrincipalUrl
- imagenAltText (optional)
