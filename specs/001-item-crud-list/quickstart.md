# Quickstart: Item CRUD and Listing

## Prerequisites
- Node.js and npm
- PostgreSQL running and accessible
- MinIO running and accessible

## Setup
1) Install dependencies
   npm install

2) Configure environment
   - Set database connection variables for PostgreSQL
   - Set MinIO connection variables and ensure bucket name is "items"

3) Run the app
   npm run dev

## Verification
- Open the item list page and verify paging, search, and filters.
- Create an item with an optional image and verify the image URL is stored.
- Edit the item and replace the image.
- Delete the item and confirm the image is removed from storage.
