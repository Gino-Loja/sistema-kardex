# Research Findings: Navegacion completa del panel y mejora del navbar

## Decision 1: Fuente de navegacion del panel
- Decision: Usar la definicion existente de paginas/secciones del panel como fuente de verdad para construir el navbar.
- Rationale: Evita duplicacion y asegura consistencia con rutas ya disponibles.
- Alternatives considered: Mantener un menu manual separado por rol; generar el menu desde archivos de ruta en tiempo de build.

## Decision 2: Orden y agrupacion
- Decision: Mantener el orden existente por modulo/seccion y paginas dentro de cada seccion.
- Rationale: Preserva la expectativa de los usuarios actuales y minimiza cambios.
- Alternatives considered: Orden alfabetico global; orden por frecuencia de uso; orden definido manualmente por negocio.

## Decision 3: Manejo de overflow
- Decision: Usar secciones colapsables con scroll interno cuando hay muchas paginas.
- Rationale: Mantiene acceso a todas las paginas sin perder jerarquia y evita menus excesivamente largos.
- Alternatives considered: Buscador interno; menu "Mas" para overflow.

## Decision 4: Filtrado por permisos
- Decision: Filtrar paginas por rol/permiso y ocultar las no autorizadas.
- Rationale: Reduce errores de acceso y mantiene la seguridad por RBAC.
- Alternatives considered: Mostrar todas y bloquear al navegar; mostrar con estado deshabilitado.

## Decision 5: Mapa de navegacion del panel
- Decision: Secciones definidas como Principal (Dashboard, Kardex), Movimientos (Movimientos), Catalogos (Items, Importar items, Terceros, Bodegas), Configuracion (Usuarios, Auditoria).
- Rationale: Respeta modulos existentes y refleja el inventario actual de paginas.
- Alternatives considered: Menu plano sin secciones; agrupar por tipo de dato en vez de modulo.
