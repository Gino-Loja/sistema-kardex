# Quickstart: Asignacion de items a bodega

## Objetivo
Verificar el flujo de asignacion de items, paginacion, edicion inline y guardado explicito en una bodega.

## Prerrequisitos
- Acceso a una bodega con permisos de bodeguero.
- Catalogo con items disponibles para asignar.

## Pasos
1. Abrir el detalle de una bodega.
2. Iniciar la accion de asignar items y confirmar que se abre un modal con buscador.
3. Buscar y seleccionar al menos 2 items y confirmar la asignacion.
4. Verificar que la tabla de items asignados muestra los nuevos items.
5. Navegar la paginacion y validar que el tamanio de pagina es 20.
6. Editar stock minimo, stock actual, stock maximo y costo promedio de un item.
7. Verificar que aparece el boton de guardar cuando hay cambios pendientes.
8. Guardar los cambios en una sola accion y confirmar que se reflejan en la tabla.
9. Intentar salir con cambios sin guardar y validar la confirmacion de descarte.
10. Eliminar un item asignado, confirmar la alerta y validar que deja de aparecer.

## Resultados esperados
- Modal de asignacion funcional con busqueda.
- Paginacion estable en 20 items por pagina.
- Edicion inline con validaciones y guardado explicito.
- Eliminacion confirmada y reflejada en la tabla.
