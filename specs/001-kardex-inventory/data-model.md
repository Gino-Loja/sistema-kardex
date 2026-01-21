# Data Model: Sistema Kardex NIIF

## Entidades y relaciones

### Usuario
- **Campos**: id, email, nombre, estado (activo/inactivo), hashContrasena,
  rolId, creadoEn, actualizadoEn
- **Reglas**: email unico; estado requerido
- **Relaciones**: Usuario pertenece a Rol; Usuario registra Movimientos

### Rol
- **Campos**: id, nombre (admin/bodeguero), descripcion
- **Reglas**: nombre unico
- **Relaciones**: Rol tiene muchos Usuarios; Rol mapea permisos RBAC

### Item
- **Campos**: id, codigo, descripcion, unidadMedida, categoria, costoPromedio,
  estado (activo/inactivo), imagenUrl, creadoEn
- **Reglas**: codigo unico; costoPromedio >= 0
- **Relaciones**: Item tiene muchos DetalleMovimiento y ItemBodega

### Bodega
- **Campos**: id, identificacion, nombre, ubicacion, estado
- **Reglas**: identificacion unica; estado requerido
- **Relaciones**: Bodega tiene muchos ItemBodega; es origen/destino de Movimientos

### ItemBodega
- **Campos**: id, itemId, bodegaId, stockMinimo, stockMaximo, stockActual
- **Reglas**: stockMinimo <= stockMaximo; stockActual >= 0
- **Relaciones**: pertenece a Item y Bodega

### Tercero
- **Campos**: id, tipo (proveedor/cliente), identificacion, nombre, telefono,
  email, direccion, estado
- **Reglas**: identificacion unica por tipo
- **Relaciones**: Tercero asociado a Movimientos (compras/ventas/devoluciones)

### MovimientoInventario
- **Campos**: id, tipo (entrada/salida/transferencia/ajuste), estado (borrador/
  publicado/anulado), fecha, bodegaOrigenId, bodegaDestinoId, terceroId,
  usuarioId, observacion
- **Reglas**: estado inmutable tras publicar; transferencias requieren origen y
  destino; salidas requieren stock disponible
- **Relaciones**: Movimiento tiene muchos DetalleMovimiento; pertenece a Usuario;
  puede vincular Tercero y Bodega(s)

### DetalleMovimiento
- **Campos**: id, movimientoId, itemId, cantidad, costoUnitario, costoTotal
- **Reglas**: cantidad > 0; costoUnitario >= 0
- **Relaciones**: pertenece a Movimiento e Item

### BitacoraAuditoria
- **Campos**: id, entidad, entidadId, accion, usuarioId, fecha, metadata
- **Reglas**: registros inmutables (append-only)
- **Relaciones**: referencia Usuario y entidad afectada

### KardexRegistro (vista/consulta)
- **Campos**: itemId, fecha, tipoMovimiento, cantidadEntrada, cantidadSalida,
  saldoFisico, costoPromedio, saldoValorizado
- **Reglas**: generado desde Movimientos publicados
- **Relaciones**: deriva de Item y MovimientoInventario

## Reglas de validacion contable (NIC 2)

- El costo promedio ponderado se recalcula en cada entrada.
- Las salidas usan el costo promedio vigente al momento de la publicacion.
- No se permiten saldos negativos salvo autorizacion explicita del Admin.

## Transiciones de estado

### MovimientoInventario
- **Borrador -> Publicado**: valida stock, reglas NIC 2, permisos RBAC.
- **Publicado -> Anulado**: registra reverso en bitacora, no permite edicion.
- **Anulado**: estado final, solo lectura.
