# Quickstart: Category CRUD and Access Control

## Prerequisites

- Node.js and npm installed
- Access to the configured PostgreSQL instance

## Run the app

1. From `C:\Users\ginol\Desktop\projects\sistema-kardex`, install dependencies if needed.
2. Start the app using the project standard command.

## Verification

- Sign in as Admin or Bodeguero.
- Navigate to `/categories` and confirm list loads.
- Create a category at `/categories/create`.
- View a category at `/categories/[id]`.
- Edit a category at `/categories/[id]/edit`.
- Delete a category and confirm items become uncategorized.
- Verify descripcion is optional on create/edit.

## Tests

- Run `npm test` for the project test suite.
- Run `npm run lint` for linting.
