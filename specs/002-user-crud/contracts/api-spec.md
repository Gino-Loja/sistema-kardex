# API Contracts: User Management

**Feature**: 002-user-crud
**Base URL**: `/api/users`
**Date**: 2026-01-13

## Authentication

All endpoints require authentication and "users:manage" permission.

**Authentication Method**: Session-based via better-auth
**Permission Required**: `users:manage`

**Error Responses**:
- `401 Unauthorized`: No valid session
- `403 Forbidden`: Insufficient permissions

## Endpoints

### 1. List Users

**Endpoint**: `GET /api/users`

**Description**: Retrieves a paginated list of users with optional filters.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number (min: 1) |
| pageSize | integer | No | 20 | Items per page (min: 1, max: 100) |
| search | string | No | - | Search by name (case-insensitive, partial match) |
| status | enum | No | - | Filter by status: "all", "active", "banned" |

**Success Response**: `200 OK`

```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "banned": false,
      "banReason": null,
      "emailVerified": true,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-10T15:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "bodeguero",
      "banned": true,
      "banReason": "Violated terms of service",
      "emailVerified": true,
      "createdAt": "2025-01-02T11:00:00.000Z",
      "updatedAt": "2025-01-11T16:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
  ```json
  {
    "error": "PARAMS_INVALID"
  }
  ```

**Notes**:
- Results are ordered by name (ascending)
- Password hashes are never included in responses
- Search matches name field only

---

### 2. Get User by ID

**Endpoint**: `GET /api/users/:id`

**Description**: Retrieves detailed information about a specific user.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Success Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "banned": false,
  "banReason": null,
  "banExpires": null,
  "emailVerified": true,
  "image": null,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-10T15:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User does not exist
  ```json
  {
    "error": "NOT_FOUND"
  }
  ```

---

### 3. Create User

**Endpoint**: `POST /api/users`

**Description**: Creates a new user account with hashed password.

**Request Body**:

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securePassword123",
  "role": "bodeguero"
}
```

**Request Schema**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Min 1 char, max 255 chars |
| email | string | Yes | Valid email format, must be unique |
| password | string | Yes | Min 8 chars |
| role | enum | Yes | "admin" or "bodeguero" |

**Success Response**: `201 Created`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "bodeguero",
  "banned": false,
  "banReason": null,
  "emailVerified": false,
  "image": null,
  "createdAt": "2026-01-13T12:00:00.000Z",
  "updatedAt": "2026-01-13T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "error": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email format"
    }
  }
  ```
- `400 Bad Request`: Duplicate email
  ```json
  {
    "error": "EMAIL_EXISTS"
  }
  ```
- `500 Internal Server Error`: Creation failed
  ```json
  {
    "error": "CREATE_FAILED"
  }
  ```

**Notes**:
- Password is automatically hashed by better-auth (never stored in plain text)
- Default values: `banned=false`, `emailVerified=false`
- Password is never included in response

---

### 4. Update User

**Endpoint**: `PUT /api/users/:id`

**Description**: Updates an existing user's information.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Request Body**:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "banned": true,
  "banReason": "Account suspended"
}
```

**Request Schema**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | No | Min 1 char, max 255 chars |
| email | string | No | Valid email format, must be unique (excluding current user) |
| role | enum | No | "admin" or "bodeguero" |
| banned | boolean | No | true or false |
| banReason | string | No | Optional reason for ban |

**Success Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "banned": true,
  "banReason": "Account suspended",
  "banExpires": null,
  "emailVerified": true,
  "image": null,
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-13T12:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "error": "VALIDATION_ERROR"
  }
  ```
- `400 Bad Request`: Duplicate email
  ```json
  {
    "error": "EMAIL_EXISTS"
  }
  ```
- `400 Bad Request`: Cannot ban self
  ```json
  {
    "error": "CANNOT_BAN_SELF"
  }
  ```
- `404 Not Found`: User does not exist
  ```json
  {
    "error": "NOT_FOUND"
  }
  ```
- `500 Internal Server Error`: Update failed
  ```json
  {
    "error": "UPDATE_FAILED"
  }
  ```

**Notes**:
- All fields are optional (partial update)
- Email uniqueness is checked excluding the current user
- Cannot ban yourself (business rule)
- `updatedAt` is automatically updated

---

### 5. Delete User

**Endpoint**: `DELETE /api/users/:id`

**Description**: Permanently deletes a user and all associated data (sessions, accounts).

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Success Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "deleted": true
}
```

**Error Responses**:
- `400 Bad Request`: Cannot delete self
  ```json
  {
    "error": "CANNOT_DELETE_SELF"
  }
  ```
- `404 Not Found`: User does not exist
  ```json
  {
    "error": "NOT_FOUND"
  }
  ```
- `500 Internal Server Error`: Deletion failed
  ```json
  {
    "error": "DELETE_FAILED"
  }
  ```

**Notes**:
- Deletion is permanent and cannot be undone
- All user sessions are automatically terminated (cascade)
- All user accounts are automatically deleted (cascade)
- Cannot delete yourself (business rule)

---

## Data Types

### User Object

```typescript
interface User {
  id: string                    // UUID
  name: string                  // Display name
  email: string                 // Email address (unique)
  role: 'admin' | 'bodeguero'   // User role
  banned: boolean               // Ban status
  banReason: string | null      // Reason for ban (if applicable)
  banExpires: string | null     // Ban expiration date (ISO 8601)
  emailVerified: boolean        // Email verification status
  image: string | null          // Profile image URL
  createdAt: string             // Creation timestamp (ISO 8601)
  updatedAt: string             // Last update timestamp (ISO 8601)
}
```

### List Response

```typescript
interface UserListResponse {
  users: User[]                 // Array of user objects
  total: number                 // Total count (for pagination)
  page: number                  // Current page number
  pageSize: number              // Items per page
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: string                 // Error code
  details?: Record<string, string>  // Optional field-level errors
}
```

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHENTICATED | 401 | No valid session |
| FORBIDDEN | 403 | Insufficient permissions |
| PARAMS_INVALID | 400 | Invalid query parameters |
| VALIDATION_ERROR | 400 | Request body validation failed |
| EMAIL_EXISTS | 400 | Email address already in use |
| NOT_FOUND | 404 | User not found |
| CANNOT_DELETE_SELF | 400 | Cannot delete your own account |
| CANNOT_BAN_SELF | 400 | Cannot ban your own account |
| CREATE_FAILED | 500 | User creation failed |
| UPDATE_FAILED | 500 | User update failed |
| DELETE_FAILED | 500 | User deletion failed |

## Rate Limiting

Not implemented in initial version. Consider adding rate limiting for:
- Create user endpoint (prevent abuse)
- Delete user endpoint (prevent accidental bulk deletion)

## Security Notes

1. **Authentication**: All endpoints require valid session
2. **Authorization**: "users:manage" permission enforced on all operations
3. **Password Security**: Passwords are never returned in responses
4. **Self-Protection**: Users cannot delete or ban themselves
5. **Email Privacy**: Consider adding email masking for non-admin users (future)
6. **Audit Logging**: Consider logging all user management actions (future)
