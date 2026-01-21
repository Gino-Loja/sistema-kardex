# Quickstart: Protected Email Login

## Prerequisites

- Node.js (compatible with Next.js 16)
- PostgreSQL instance
- (Optional) MinIO if running full app assets locally

## Environment Variables

Set these in `.env` (values depend on your environment):

- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- DATABASE_URL
- MINIO_ACCESS_KEY
- MINIO_SECRET_KEY
- MINIO_ENDPOINT
- MINIO_PORT
- MINIO_USE_SSL

## Install and Run

```bash
npm install
npm run dev
```

## Verify

- Visit `/login` and confirm unauthenticated users are redirected from protected routes.
- Sign in with email/password and confirm role-based access control.
- Trigger password reset flow and confirm new password works.

## Tests

```bash
npm test
npm run lint
```
