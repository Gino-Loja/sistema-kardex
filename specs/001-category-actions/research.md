# Research: Category actions (edit/delete)

## Decision 1: Delete behavior for in-use categories
- Decision: Allow deleting a category even if it has items; items become uncategorized.
- Rationale: Matches clarified requirements and avoids blocking cleanup workflows.
- Alternatives considered: Block deletion with error; require reassignment before delete.

## Decision 2: Permission-based visibility for actions
- Decision: Hide actions that the current user is not allowed to perform.
- Rationale: Prevents unauthorized affordances and reduces user confusion.
- Alternatives considered: Show disabled actions with tooltips.

## Decision 3: Success feedback for delete
- Decision: Show a confirmation in the list (toast or banner) after a successful delete.
- Rationale: Provides clear feedback without interrupting flow.
- Alternatives considered: Rely solely on row disappearance.

## Decision 4: Confirmation modal content
- Decision: Modal title "Eliminar categoria" with a message about items becoming uncategorized.
- Rationale: Ensures users understand impact before confirming.
- Alternatives considered: Generic confirmation text without impact detail.

## Decision 5: Concurrent delete handling
- Decision: If the category is already deleted, close the modal silently.
- Rationale: Avoids noisy errors for expected concurrency edge case.
- Alternatives considered: Show an explicit "already deleted" message.
