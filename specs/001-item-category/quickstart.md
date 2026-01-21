# Quickstart: Item nombre y categoria opcional

## Prerequisites

- Node.js + npm available
- Database configured (PostgreSQL)
- Required environment variables set in `.env`

## Local Run

1. Install dependencies:
   - `npm install`
2. Apply migrations (if needed):
   - `npm run db:migrate` (use project-specific command if different)
3. Start dev server:
   - `npm run dev`

## Smoke Tests

- Create a category via UI or API and verify it appears in the category list.
- Create an item with `nombre` and optional `categoriaId` (or without category).
- Update an item to remove its `categoriaId`.
- Delete a category and verify items remain without category.

## Acceptance Checks

- Creating a category with a duplicate name returns a clear error.
- Item creation fails when `nombre` is empty.
- UI shows categories in item create/edit forms.
