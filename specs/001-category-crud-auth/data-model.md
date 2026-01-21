# Data Model: Categories

## Entities

### Category

- Fields:
  - id (unique identifier)
  - name (required, unique case-insensitive)
  - description (optional)
- Relationships:
  - A category can be linked to many items.
  - Items reference a category through a nullable categoryId.
- Validation rules:
  - name is required and trimmed.
  - name must be unique ignoring case.
  - description is optional.
- Lifecycle:
  - Created -> Updated -> Deleted
  - On delete, related items have categoryId set to null.

### Item (existing)

- Fields (relevant):
  - categoryId (nullable reference to Category)

## Notes

- Deleting a category does not delete items; items become uncategorized.
