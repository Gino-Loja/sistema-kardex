# Data Model: Protected Email Login

## Entities

### User
- id
- email
- password_hash
- role_id
- status (active, disabled)
- created_at
- updated_at

### Role
- id
- name (admin, bodeguero)
- permissions

### Session
- id
- user_id
- created_at
- expires_at

### PasswordResetToken
- id
- user_id
- token
- expires_at
- used_at

## Relationships

- User belongs to Role (many-to-one)
- Session belongs to User (many-to-one)
- PasswordResetToken belongs to User (many-to-one)

## Validation Rules

- email is required and unique per user
- password_hash required for email/password accounts
- role_id required for all users
- password reset tokens expire and are single-use

## State Transitions

- Session: active -> expired
- PasswordResetToken: pending -> used or expired
- User status: active -> disabled (access denied)
