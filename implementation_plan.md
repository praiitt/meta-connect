# Implementation Plan: Phase 1 & 2 Refinements

## Phase 1: Order History (Mobile)
- Add a status filter (All, Pending, Confirmed, Shipped, Delivered, Cancelled) to `app/(tabs)/orders.tsx` to allow users to filter their order history.

## Phase 2: Product Search & Filtering (Mobile + Web)
- **Mobile Catalog (`app/(tabs)/catalog.tsx`)**:
  - Add a search bar at the top to filter products by name/SKU.
  - Add an "In Stock Only" toggle.
- **Admin Products (`web/src/pages/Products.tsx`)**:
  - Add a search input above the products table.
  - Add a filter by stock status (All, In Stock, Out of Stock).