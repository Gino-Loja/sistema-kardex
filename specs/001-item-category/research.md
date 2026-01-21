# Research: Item nombre y categoria opcional

## Decision 1: Category lifecycle and removal behavior
- Decision: Allow categories to be active or inactive; deletion removes the category and leaves items without category.
- Rationale: Spec requires items remain valid when a category is removed or deactivated; a simple lifecycle supports auditability and UX clarity.
- Alternatives considered: Hard delete only; soft delete only without inactive state.

## Decision 2: Optional single-category association
- Decision: Each item can have zero or one category; category is optional on create/edit.
- Rationale: Aligns with clarified requirements and minimizes relational complexity.
- Alternatives considered: Multi-category tagging; mandatory category assignment.
