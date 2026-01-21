# Feature Specification: User Management CRUD

**Feature Branch**: `002-user-crud`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "quiero tener el crud entero de usuarios en donde http://localhost:3000/settings/users/create sea el formulario para crear y http://localhost:3000/settings/users/[id]/edit para editar y poder eliminar el usuario. debes hacerlo median better-auth la libreria que controla esto de los usuarios y la autenticacion. La tabla debe tener paginacion y se deben mostrar 20 filas debe haber filtros por estado y buscar por nombre."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View User List (Priority: P1)

An administrator needs to see all users in the system to monitor who has access and manage their accounts effectively. The list should display essential user information and allow quick searching and filtering to find specific users.

**Why this priority**: This is the foundation of user management. Without being able to view existing users, no other management actions are possible. This provides immediate value by giving administrators visibility into all system users.

**Independent Test**: Can be fully tested by navigating to the users list page and verifying that existing users are displayed with pagination, and delivers value by allowing administrators to see all system users at a glance.

**Acceptance Scenarios**:

1. **Given** an administrator is logged in, **When** they navigate to `/settings/users`, **Then** they see a table showing all users with name, email, role, status (active/banned), and creation date
2. **Given** there are more than 20 users in the system, **When** viewing the user list, **Then** pagination controls appear showing 20 users per page with page numbers and next/previous buttons
3. **Given** an administrator is on the user list page, **When** they use the search field to enter a user name, **Then** the table filters to show only users matching that name
4. **Given** an administrator is on the user list page, **When** they select a status filter (active/banned), **Then** the table shows only users with that status
5. **Given** an administrator applies multiple filters, **When** they navigate to page 2, **Then** the filters persist and show page 2 of filtered results

---

### User Story 2 - Create New User (Priority: P2)

An administrator needs to create new user accounts for employees who need access to the system. They should be able to set the user's name, email, password, and role during creation.

**Why this priority**: Creating new users is essential for onboarding new team members. This is prioritized after viewing because administrators need to see existing users before adding new ones to avoid duplicates.

**Independent Test**: Can be fully tested by navigating to the create user form, filling in required fields, and verifying the user appears in the user list after creation.

**Acceptance Scenarios**:

1. **Given** an administrator clicks "Nuevo usuario" button, **When** they navigate to `/settings/users/create`, **Then** they see a form with fields for name, email, password, and role selection
2. **Given** an administrator is on the create user form, **When** they submit with all required fields filled correctly, **Then** a new user is created and they are redirected to the user list with a success message
3. **Given** an administrator is on the create user form, **When** they try to submit without required fields, **Then** validation errors appear highlighting missing fields
4. **Given** an administrator tries to create a user, **When** they enter an email that already exists, **Then** an error message appears stating "This email is already registered"
5. **Given** an administrator is on the create user form, **When** they select a role from the dropdown, **Then** they can choose between "admin" and "bodeguero" roles

---

### User Story 3 - Edit Existing User (Priority: P3)

An administrator needs to update user information such as name, email, or role, or change a user's status (ban/unban) when circumstances require account modifications.

**Why this priority**: Editing users is important for maintaining accurate information and managing access, but it's less critical than viewing and creating users. Users must exist before they can be edited.

**Independent Test**: Can be fully tested by navigating to an existing user's edit page, modifying their information, and verifying the changes persist in the user list.

**Acceptance Scenarios**:

1. **Given** an administrator is viewing the user list, **When** they click the edit action on a user row, **Then** they navigate to `/settings/users/[id]/edit` with the form pre-filled with current user data
2. **Given** an administrator is on the edit user form, **When** they modify the name and submit, **Then** the user's name is updated and they see a success message
3. **Given** an administrator is on the edit user form, **When** they change the role from "bodeguero" to "admin", **Then** the user's permissions are updated to admin level
4. **Given** an administrator is on the edit user form, **When** they toggle the banned status to banned and provide a ban reason, **Then** the user cannot log in and sees their ban reason
5. **Given** an administrator edits a user's email, **When** they enter an email already used by another user, **Then** an error message appears preventing the duplicate email

---

### User Story 4 - Delete User (Priority: P4)

An administrator needs to permanently remove user accounts that are no longer needed, such as when employees leave the organization.

**Why this priority**: Deletion is the least frequently needed operation and has the most severe consequences if done incorrectly. It requires all other CRUD operations to be in place first.

**Independent Test**: Can be fully tested by selecting a user from the list, initiating deletion, confirming the action, and verifying the user no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** an administrator is viewing the user list or edit page, **When** they click the delete button for a user, **Then** a confirmation modal appears asking "Are you sure you want to delete this user?"
2. **Given** an administrator sees the delete confirmation modal, **When** they confirm the deletion, **Then** the user is permanently removed from the system and they return to the user list with a success message
3. **Given** an administrator sees the delete confirmation modal, **When** they cancel the deletion, **Then** no changes are made and the modal closes
4. **Given** an administrator tries to delete their own account, **When** they initiate deletion, **Then** an error message appears preventing self-deletion
5. **Given** a user has active sessions, **When** an administrator deletes their account, **Then** all associated sessions are automatically terminated

---

### Edge Cases

- **Self-ban prevention**: System prevents administrators from banning themselves, displaying error message "Cannot ban your own account"
- **Last admin protection**: System prevents deletion or role change of the last remaining admin user, displaying error message "Cannot remove last administrator"
- **Concurrent edits**: System uses last-write-wins strategy with no conflict detection (simpler implementation, acceptable for low-frequency user management operations)
- **Banned user login**: Banned users see generic invalid credentials message (no indication of ban status for security)
- How does the system handle very long names or emails in the table display?
- What happens when pagination parameters are manipulated in the URL (e.g., negative page numbers)?
- How does the system handle special characters in the search field?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of all users showing name, email, role, status (active/banned), and creation date
- **FR-002**: System MUST paginate the user list showing exactly 20 users per page
- **FR-003**: System MUST provide a search filter that finds users by name (case-insensitive partial match)
- **FR-004**: System MUST provide a status filter with options for "all", "active", and "banned" users
- **FR-005**: System MUST maintain filter and search parameters when navigating between pages
- **FR-006**: System MUST provide a form to create new users at `/settings/users/create` with fields for name, email, password, and role
- **FR-007**: System MUST validate that email addresses are unique before creating a user
- **FR-008**: System MUST validate that all required fields (name, email, password, role) are provided before user creation
- **FR-009**: System MUST allow administrators to assign users to either "admin" or "bodeguero" roles
- **FR-010**: System MUST provide a form to edit existing users at `/settings/users/[id]/edit` with pre-filled current data
- **FR-011**: System MUST allow updating user name, email, role, and banned status
- **FR-012**: System MUST validate unique email addresses when editing users (excluding the current user's own email)
- **FR-013**: System MUST provide a delete action with confirmation modal before permanently removing users
- **FR-014**: System MUST prevent administrators from deleting their own account
- **FR-014a**: System MUST prevent administrators from banning themselves and display error "Cannot ban your own account"
- **FR-014b**: System MUST prevent deletion or role demotion of the last remaining admin user and display error "Cannot remove last administrator"
- **FR-015**: System MUST terminate all active sessions when a user is deleted
- **FR-016**: System MUST prevent banned users from authenticating and display generic "Invalid credentials" message (no indication of ban status)
- **FR-017**: System MUST restrict all user management operations to users with "users:manage" permission
- **FR-018**: System MUST display appropriate success messages after create, update, and delete operations
- **FR-019**: System MUST display appropriate error messages for validation failures and system errors
- **FR-020**: System MUST use better-auth library for all user authentication and management operations

### Key Entities

- **User**: Represents a system user with attributes: id, name, email, role, banned status, ban reason, ban expiry date, email verification status, creation date, and update date. Related to sessions and accounts through better-auth.
- **Role**: Defines user permission levels with two types: "admin" (full system access including user management) and "bodeguero" (limited access to inventory operations).
- **Session**: Represents an active user session managed by better-auth, automatically created on login and terminated on logout or user deletion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view the complete user list with pagination in under 2 seconds
- **SC-002**: Search and filter operations return results in under 1 second
- **SC-003**: New users can be created in under 30 seconds from form access to completion
- **SC-004**: User information updates are reflected immediately (within 1 second) after submission
- **SC-005**: Banned users are prevented from logging in within 5 seconds of ban status change
- **SC-006**: 95% of user management tasks are completed without errors on first attempt
- **SC-007**: System prevents all unauthorized access attempts to user management features (100% enforcement of "users:manage" permission)
- **SC-008**: Zero data loss incidents when deleting users (all related data properly cascade deleted)

## Assumptions

- The existing better-auth setup with admin plugin and access control is already configured and working
- The application uses the existing role-based permission system with "admin" and "bodeguero" roles
- Email addresses are the primary unique identifier for users
- Password requirements follow better-auth's default validation rules
- The UI follows the existing design patterns used in the items CRUD (similar layout, components, and styling)
- The system uses PostgreSQL database with Drizzle ORM as indicated by existing schema
- Users with "admin" role have the "users:manage" permission required for all operations
- The default role for new users will be "bodeguero" unless explicitly set to "admin"

## Dependencies

- better-auth library (already installed, version 1.4.10)
- Existing auth configuration and session management
- Existing user table schema in the database
- Existing permission system and role definitions
- UI components library (buttons, forms, tables, modals)

## Out of Scope (Future Enhancements)

- Audit logging for user management actions (deferred to future phase)
- Email verification workflow
- Self-service password reset
- Bulk user operations
- User import/export functionality
- Advanced search capabilities (by email, multiple filters)
- Temporary ban expiration automation

## Clarifications

### Session 2026-01-13

- Q: What happens when the last admin user is deleted or demoted? → A: Prevent demotion/deletion of last admin with explicit error message
- Q: What happens when an administrator tries to ban themselves? → A: Prevent admin from banning themselves with error message
- Q: How does the system handle concurrent edits when two administrators edit the same user simultaneously? → A: Last-write-wins (no conflict detection, simpler implementation)
- Q: What happens when a banned user tries to log in? → A: Completely block login with no message (appears as invalid credentials)
- Q: Should the system implement audit logging for user management actions? → A: Defer to future enhancement (focus on core CRUD first)
