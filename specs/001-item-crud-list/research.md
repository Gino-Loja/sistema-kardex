# Research Findings: Item CRUD and Listing

## Decision 1: Store item images in MinIO bucket "items"
- Decision: Use MinIO object storage with a dedicated bucket named "items" and store the object URL in the item record.
- Rationale: Object storage is best suited for images, keeps the database small, and aligns with current stack.
- Alternatives considered: Store image bytes in the database; store images on local disk. Rejected due to scalability and deployment constraints.

## Decision 2: Use multipart/form-data for create/edit with optional image
- Decision: Accept item fields and optional image upload in a single multipart request for create and edit.
- Rationale: Simplifies the client flow and keeps item + image operations atomic at the request level.
- Alternatives considered: Separate upload endpoint with subsequent item update; base64 JSON payload. Rejected due to extra steps and payload size.

## Decision 3: List filters and pagination contract
- Decision: Use standard pagination params (page, pageSize) and filters (search by name, status, created date range).
- Rationale: Matches the spec and is easy to test and document.
- Alternatives considered: Cursor-based pagination; server-side stored filter presets. Rejected for simplicity.

## Decision 4: Enforce image constraints at validation
- Decision: Enforce max size 5 MB and allowed formats JPEG/PNG/WebP on both client and server.
- Rationale: Prevents invalid uploads early and ensures consistent storage.
- Alternatives considered: Server-only validation; allowing any format. Rejected for UX and security reasons.

## Decision 5: Delete image when item is deleted
- Decision: Remove the item image from MinIO when the item is deleted.
- Rationale: Avoids orphaned files and keeps storage clean.
- Alternatives considered: Keep image forever; prompt on delete. Rejected due to storage waste and UX complexity.
