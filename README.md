# Sistema Kardex NIIF

Sistema de gestion de inventario Kardex alineado a NIC 2 con roles, movimientos,
valorizacion automatica, reportes y catalogos.

## Requisitos

- Node.js (compatible con Next.js 16)
- PostgreSQL
- MinIO (S3 compatible) para imagenes de productos

## Configuracion

Crear un archivo `.env.local` en la raiz del proyecto:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
BETTER_AUTH_SECRET=change_me
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=change_me
RESEND_FROM=Kardex <no-reply@tu-dominio.com>
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=change_me
MINIO_SECRET_KEY=change_me
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_BUCKET=kardex-items
```

## Desarrollo

```bash
npm install
npm run dev
```

## Autenticacion

- Ruta publica: `/login` (el resto requiere sesion).
- El inicio de sesion usa correo y contrasena.
- El restablecimiento de contrasena envia un enlace al correo configurado con Resend.

## Comandos utiles

```bash
npm run lint
npm test
```
