# Data Model: Third Parties Management

## Entity: ThirdParty

**Description**: External person or organization used in inventory flows.

**Fields**
- id (unique identifier)
- identifier (unique business identifier)
- displayName (required)
- contactName (optional)
- contactEmail (optional)
- contactPhone (optional)
- status (active/inactive)
- createdAt
- updatedAt

**Relationships**
- May be referenced by inventory documents or movements (read-only linkage for this feature).

**Validation Rules**
- identifier is required and unique.
- displayName is required.
- contactEmail, if provided, must be a valid email format.

**State Transitions**
- status can change between active and inactive via edit.
