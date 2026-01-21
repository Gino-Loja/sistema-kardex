# Implementation Plan: Protected Email Login

**Branch**: `001-better-auth-login` | **Date**: 2026-01-07 | **Spec**: `specs/001-better-auth-login/spec.md`
**Input**: Feature specification from `/specs/001-better-auth-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement email/password login with better-auth, enforce protected routes and RBAC, redirect unauthenticated users to `/login`, and redirect authenticated users on `/login` to their last requested protected route, including a password reset flow.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.1.1 (App Router), React 19.2.3, better-auth 1.4.10, Drizzle ORM, Tailwind CSS 4  
**Storage**: PostgreSQL (primary), MinIO (assets)  
**Testing**: Vitest, React Testing Library, Playwright  
**Target Platform**: Web (Node.js server + browser clients)  
**Project Type**: Web application (single Next.js app)  
**Performance Goals**: Redirect unauthenticated users to login within 1s p95; auth checks add <100ms p95 per request  
**Constraints**: Only `/login` and public assets are unauthenticated; RBAC enforced per route; no idle-timeout beyond session expiry; App Router + DAL boundaries  
**Scale/Scope**: Up to 1,000 concurrent sessions; all dashboard routes protected

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

Status: PASS (no violations planned)

## Project Structure

### Documentation (this feature)

```text
specs/001-better-auth-login/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single project (Next.js App Router)
src/
├── app/
├── components/
├── hooks/
├── lib/
└── scripts/

public/

tests/
```

**Structure Decision**: Single Next.js application under `src/` with App Router
and shared domain/data logic in `src/lib`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

No constitution violations.

## Phase 0: Outline & Research

### Research Tasks

- Document auth approach and route protection pattern for App Router + better-auth.
- Document redirect behavior for `/login` (last requested protected route).
- Document password reset flow boundaries (request + reset).

### Output

- `specs/001-better-auth-login/research.md`

## Phase 1: Design & Contracts

### Data Model

- Capture auth-related entities and relationships for users, sessions, roles, and password resets.
- Output: `specs/001-better-auth-login/data-model.md`

### API Contracts

- Define auth endpoints for login, logout, session lookup, password reset request, and reset confirmation.
- Output: `specs/001-better-auth-login/contracts/auth.yaml`

### Quickstart

- Document environment variables and local run steps for the feature.
- Output: `specs/001-better-auth-login/quickstart.md`

### Agent Context Update

- Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex`

## Constitution Check (Post-Design)

Status: PASS (no violations introduced)
