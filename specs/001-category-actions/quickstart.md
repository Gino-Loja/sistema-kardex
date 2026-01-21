# Quickstart: Category actions (edit/delete)

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

- Open the category list and verify each row shows an actions menu.
- Use Edit from the actions menu and confirm it navigates to `/categories/{id}/edit`.
- Use Delete to open the confirmation modal with the impact message.
- Confirm delete and verify the category disappears and a success message shows.
- Verify items that referenced the deleted category now have no category.

## Acceptance Checks

- Users without edit permission do not see the Edit action.
- Users without delete permission do not see the Delete action.
- If the category was already deleted, the modal closes without an error message.
