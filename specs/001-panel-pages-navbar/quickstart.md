# Quickstart: Navbar con todas las paginas

## Objetivo
Validar que el navbar lista todas las paginas del panel, respeta permisos y mantiene orden/agrupacion.

## Pasos
1. Iniciar el proyecto y autenticarse como Admin.
2. Verificar que el navbar muestre todas las secciones y paginas del panel.
3. Abrir varias paginas y confirmar estado activo y navegacion correcta.
4. Autenticarse como Bodeguero y confirmar que solo se muestran paginas permitidas.
5. Forzar un rol sin acceso y confirmar mensaje de falta de paginas.
6. Simular pantalla pequena y verificar acceso completo via secciones colapsables.
7. Probar colapsar/expandir secciones con muchos elementos y validar scroll interno.

## Resultado esperado
- Todas las paginas accesibles desde el navbar en maximo 2 interacciones.
- Orden y agrupacion consistentes con el modulo/seccion existente.
- No se muestran enlaces sin permiso.
- Secciones colapsables funcionan con scroll interno en pantallas pequenas.
