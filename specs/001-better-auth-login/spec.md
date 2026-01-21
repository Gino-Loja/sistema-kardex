# Feature Specification: Protected Email Login

**Feature Branch**: `001-better-auth-login`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "quiero que implementes el login con contrasena y email usando better-auth hasta ahora yo puedo acceder a todas las rutas esto deberia estar protegido ya que implemente DAL y tengo roles si no tengo sesion me deberia redireccionar a http://localhost:3000/login y si tengo a la app http://localhost:3000/login"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceso protegido con login (Priority: P1)

As a user, I must sign in with email and password before I can access protected areas of the app, and I can reset my password if I forget it.

**Why this priority**: Prevents unauthorized access and is the core value of the feature.

**Independent Test**: Can be fully tested by attempting to access a protected route without a session and completing login to gain access.

**Acceptance Scenarios**:

1. **Given** I am not signed in, **When** I request any protected route, **Then** I am redirected to the login page.
2. **Given** I sign in with valid email and password, **When** authentication succeeds, **Then** I can access protected routes.
3. **Given** I forgot my password, **When** I request a reset and complete it, **Then** I can sign in with the new password.

---

### User Story 2 - Role-based access control (Priority: P2)

As a signed-in user, I can only access routes that match my assigned role permissions.

**Why this priority**: Ensures existing roles and permissions are enforced consistently.

**Independent Test**: Can be tested by signing in with different roles and checking access to role-restricted routes.

**Acceptance Scenarios**:

1. **Given** I am signed in with a role that lacks permission, **When** I navigate to a restricted route, **Then** access is denied and a clear message is shown.

---

### User Story 3 - Login page redirect for active sessions (Priority: P3)

As a signed-in user, I should not stay on the login page and should be redirected to the main app area.

**Why this priority**: Avoids confusion and streamlines navigation for authenticated users.

**Independent Test**: Can be tested by visiting the login page while already signed in and confirming the redirect.

**Acceptance Scenarios**:

1. **Given** I am already signed in, **When** I open the login page, **Then** I am redirected to the last requested protected route.

---

### Edge Cases

- What happens when login credentials are invalid or missing?
- How does the system handle an expired session during navigation?
- What happens when a user has a role that was removed or changed after login?
- What happens when a password reset request is invalid or expired?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide sign-in using email and password.
- **FR-002**: System MUST treat all application routes as protected except the login page and explicitly public assets.
- **FR-003**: System MUST redirect unauthenticated users who request a protected route to the login page.
- **FR-004**: System MUST redirect authenticated users away from the login page to the last requested protected route.
- **FR-005**: System MUST enforce role-based access so users can only access routes allowed by their role.
- **FR-006**: System MUST preserve a user session across page loads until they sign out or the session expires; no idle-timeout is required.
- **FR-007**: Users MUST be able to request a password reset and set a new password.
- **FR-008**: System MUST NOT allow self-signup; user accounts are created by admins.

### Non-Functional Requirements (Constitutional)

- **NFR-SEC-001**: System MUST enforce authentication/authorization on protected
  routes and validate RBAC permissions per operation (Admin, Bodeguero).
- **NFR-SEC-002**: System MUST sanitize inputs and handle file uploads securely.
- **NFR-SEC-003**: System MUST log audit events for critical operations.
- **NFR-DATA-001**: System MUST preserve referential integrity and use transactions
  for critical operations.
- **NFR-DATA-002**: System MUST validate NIC 2 accounting rules and maintain an
  append-only movement ledger.
- **NFR-DATA-003**: System MUST compute weighted average cost automatically.
- **NFR-UX-001**: System MUST provide clear loading/error states and real-time form
  validation.
- **NFR-UX-002**: System MUST confirm destructive actions and be responsive.
- **NFR-QUAL-001**: Critical accounting logic MUST be tested; complex functions MUST
  be documented.
- **NFR-QUAL-002**: System MUST handle errors robustly and optimize performance
  (lazy loading, streaming where applicable).

### Key Entities *(include if feature involves data)*

- **User**: Person with an account, identified by email and linked to a role.
- **Session**: Active authentication state that grants access to protected routes.
- **Role**: Permission grouping that controls which routes a user can access.
- **Protected Route**: Any route that requires an authenticated session and role permission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of protected routes require a valid session and deny access when no session exists.
- **SC-002**: 95% of users can sign in with email and password and reach the app within 60 seconds.
- **SC-003**: 100% of role-restricted routes deny access to users without the required role.
- **SC-004**: 90% of users who are already signed in are redirected off the login page on first attempt.

## Assumptions

- The login page is the only public UI route; all other app routes are protected.
- A user-friendly error message is shown when access is denied or credentials are invalid.

## Dependencies

- Roles and route permissions already exist and can be evaluated during access checks.

## Clarifications

### Session 2026-01-07

- Q: Should users be able to self-signup? → A: No, users are created by admins only.
- Q: Where should an already signed-in user be sent when they visit `/login`? → A: Last requested protected route.
- Q: Are there any public routes besides `/login` and public assets? → A: No, only `/login` and public assets are public.
- Q: Should a password reset flow be included? → A: Yes, include request and reset.
- Q: Is an idle-session timeout required? → A: No, only sign-out or expiry ends sessions.
