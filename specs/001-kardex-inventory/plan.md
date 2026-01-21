# Implementation Plan: Sistema Kardex NIIF

**Branch**: `001-kardex-inventory` | **Date**: 2026-01-04 | **Spec**: specs/001-kardex-inventory/spec.md
**Input**: Feature specification from `/specs/001-kardex-inventory/spec.md`

## Summary

Implement a Kardex inventory management system aligned to NIC 2 with RBAC, dashboard,
master data, movement workflow, weighted average valuation, reporting, and CSV
imports/exports. The technical approach uses Next.js App Router with layered
architecture, Drizzle ORM over PostgreSQL, and shared validation on server and client.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS 4,
shadcn/ui, React Hook Form + Zod, TanStack Query, Drizzle ORM/Kit, Better-Auth, Resend,
MinIO client  
**Storage**: PostgreSQL (primary), MinIO (product images)  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (e2e)  
**Target Platform**: Web (modern browsers), tablets  
**Project Type**: web application  
**Performance Goals**: inventory queries < 2s in normal operation; monthly reports < 1 min  
**Constraints**: NIC 2 compliance, append-only ledger, no negative stock without Admin
authorization, published movements immutable, automated backups  
**Scale/Scope**: 1-2 Admin users, 2-3 Bodeguero users, ~100 movements/day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Arquitectura en capas con DAL definida y limites entre presentacion, aplicacion,
  dominio e infraestructura.
- TypeScript `strict` + `noImplicitAny` activos; contratos tipados entre capas.
- Server Components por defecto; Client Components justificados por necesidad de UI.
- Nomenclatura: espanol para logica de negocio, ingles para componentes/estructura.
- Validacion de datos en cliente y servidor con reglas consistentes.
- Seguridad: autenticacion/autorizacion en rutas protegidas, RBAC, sanitizacion de
  inputs, uploads seguros, auditoria en operaciones criticas.
- Roles y permisos: Admin con acceso total; Bodeguero con movimientos, inventario
  y reportes basicos.
- Datos: integridad referencial, transacciones en operaciones criticas, reglas NIC 2,
  bitacora append-only, costo promedio ponderado automatico.
- UX: feedback claro, estados de carga/error, validacion en tiempo real,
  confirmaciones destructivas, responsive.
- Calidad: tests para logica contable critica, errores robustos, performance con
  lazy loading/streaming, documentacion de funciones complejas.

## Project Structure

### Documentation (this feature)

```text
specs/001-kardex-inventory/
|-- plan.md              # This file (/speckit.plan command output)
|-- research.md          # Phase 0 output (/speckit.plan command)
|-- data-model.md        # Phase 1 output (/speckit.plan command)
|-- quickstart.md        # Phase 1 output (/speckit.plan command)
|-- contracts/           # Phase 1 output (/speckit.plan command)
|-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
|-- app/
|   |-- (auth)/
|   |-- (dashboard)/
|   |   |-- dashboard/
|   |   |-- items/
|   |   |-- warehouses/
|   |   |-- movements/
|   |   |-- kardex/
|   |   |-- settings/
|   |   |   |-- users/
|   |   |   |-- audit-log/
|-- components/
|-- lib/
|   |-- actions/
|   |-- queries/
|   |-- validations/
|   |-- auth/
|   |-- dal/
|   |   |-- repositories/
|   |   |-- services/
|   |-- db/
|       |-- schema/
|       |-- migrations/
|       |-- index.ts

tests/
|-- unit/
|-- integration/
|-- e2e/
```

**Structure Decision**: Single Next.js application with App Router and a layered
/lib boundary for application, DAL, and data access; UI in /app and /components.

## Complexity Tracking

No constitution violations identified.
