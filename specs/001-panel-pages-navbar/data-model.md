# Data Model: Navegacion del panel

## Entities

### NavigationSection
- Represents: Seccion de navegacion dentro del panel.
- Fields:
  - id (unique)
  - name
  - order
  - isCollapsible
- Relationships:
  - has many NavigationItem

### NavigationItem
- Represents: Pagina navegable del panel.
- Fields:
  - id (unique)
  - label
  - route
  - order
  - sectionId (reference)
  - requiredRoles (list)
- Relationships:
  - belongs to NavigationSection

### Role
- Represents: Rol de usuario (Admin, Bodeguero).
- Fields:
  - id (unique)
  - name

### User
- Represents: Usuario autenticado del panel.
- Fields:
  - id (unique)
  - roleIds (list)

## Validation Rules
- NavigationItem.route must be unique within panel routes.
- NavigationItem.order must be stable within its section.
- requiredRoles must map to known roles.

## State Transitions
- N/A (read-only navigation metadata).
