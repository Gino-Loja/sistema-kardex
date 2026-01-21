# Research: Vista de detalles de item

## Summary

No open technical unknowns required additional research. Decisions reuse the existing stack and routes.

## Findings

- Decision: Reusar la ruta de detalles `items/[id]` existente en App Router.
  Rationale: Minimiza cambios y alinea con la estructura actual.
  Alternatives considered: Crear una vista separada fuera de `items/[id]`.

- Decision: Ocultar acciones sin permiso en la lista.
  Rationale: Evita errores y confusiones al operar items.
  Alternatives considered: Mostrar deshabilitado o bloquear al intentar.

- Decision: Mensaje de item no encontrado con enlace a la lista.
  Rationale: Mantiene contexto y facilita recuperacion.
  Alternatives considered: Redireccion automatica sin explicacion.
