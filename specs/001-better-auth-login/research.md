# Research Notes: Protected Email Login

## Decisions

### Decision: Use better-auth for email/password and RBAC enforcement
**Rationale**: The project already includes better-auth configuration and role definitions, reducing integration risk and keeping auth consistent across server and client.
**Alternatives considered**: Custom auth implementation, switching to a different auth provider.

### Decision: Protect routes with App Router checks plus server-side guards
**Rationale**: Route-level protection and server-side checks ensure both navigation and data access are secured, preventing client-only bypass.
**Alternatives considered**: Client-only route guards.

### Decision: Redirect authenticated users from `/login` to the last requested protected route
**Rationale**: Preserves user intent and reduces friction after authentication.
**Alternatives considered**: Always redirect to app home, role-based landing pages.

### Decision: Include password reset request + reset flow
**Rationale**: Standard user recovery flow, improves accessibility without expanding scope beyond authentication.
**Alternatives considered**: Admin-only password resets, request-only flow.

### Decision: No idle-timeout beyond session expiry
**Rationale**: Aligns with clarified requirements and avoids unexpected sign-outs during work sessions.
**Alternatives considered**: Short idle timeout with re-authentication.
