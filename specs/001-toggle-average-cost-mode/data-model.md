# Data Model: Toggle Average Cost Calculation Mode

This document outlines the data model changes required to implement the feature. The information is derived from the `Key Entities` section of the feature specification.

## Existing Entities (with modifications)

### 1. Warehouse (`bodegas`)

Represents a physical or logical storage location.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Not Null | Unique identifier for the warehouse. |
| `name` | `varchar` | Not Null | The user-facing name of the warehouse. |
| `auto_update_average_cost` | `boolean` | Not Null, **Default: `false`** | **(New Field)** Flag to determine if the average cost should be updated automatically. `false` corresponds to 'Manual' mode. |

## Related Entities (no modifications)

### 2. ItemWarehouse (`item_bodegas`)

A join table representing an item's status within a specific warehouse. The `costoPromedio` field in this table is the target of the automatic calculation.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `itemId` | `uuid` | Foreign Key, Not Null | References the `items` table. |
| `bodegaId` | `uuid` | Foreign Key, Not Null | References the `bodegas` table. |
| `stock` | `integer` | Not Null | The current quantity of the item in the warehouse. |
| `costoPromedio` | `numeric` | Not Null | The calculated average cost of the item in this warehouse. |

### 3. Movement (`movimientos`)

Records the transaction of items into or out of a warehouse. An inbound movement (`entrada`) is the trigger for the automatic cost calculation.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Not Null | Unique identifier for the movement. |
| `type` | `varchar` | Not Null | The type of movement (e.g., 'entrada', 'salida'). |
| `itemId` | `uuid` | Foreign Key, Not Null | References the `items` table. |
| `bodegaId`| `uuid` | Foreign Key, Not Null | References the `bodegas` table. |
| `quantity` | `integer` | Not Null | The quantity of the item in the movement. |
| `cost` | `numeric` | Not Null | The cost associated with the item in the movement. |
