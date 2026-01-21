# Quickstart: Sistema Kardex NIIF

## Prerequisitos

- Node.js (version compatible con Next.js 16)
- PostgreSQL
- MinIO (S3 compatible) para imagenes de productos

## Configuracion

Crear un archivo `.env.local` con:

- DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
- BETTER_AUTH_SECRET=change_me
- BETTER_AUTH_URL=http://localhost:3000
- RESEND_API_KEY=change_me
- RESEND_FROM=Kardex <no-reply@tu-dominio.com>
- MINIO_ENDPOINT=localhost
- MINIO_ACCESS_KEY=change_me
- MINIO_SECRET_KEY=change_me
- MINIO_PORT=9000
- MINIO_USE_SSL=false
- MINIO_BUCKET=kardex-items

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

## Comandos utiles

```bash
npm run lint
npm test
```
