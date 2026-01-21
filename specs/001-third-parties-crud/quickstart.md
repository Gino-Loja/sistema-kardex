# Quickstart: Third Parties Management

## Purpose

Verify the third parties CRUD flow and pagination manually.

## Steps

1. Start the app:
   - `npm run dev`
2. Open the list page in a browser.
3. Confirm the list shows 20 rows per page and page navigation controls.
4. Create a new third party via `/third-parties/create` and verify it appears in the list.
5. Open a row detail using the View action and confirm it is read-only.
6. Edit a record via `/third-parties/{id}/edit` and confirm the list updates.
7. Delete a record from the list and confirm the modal appears before removal.

## Expected Results

- List pagination works with 20 items per page.
- Create, view, edit, and delete flows complete without errors.
- Delete always requires confirmation before removal.
