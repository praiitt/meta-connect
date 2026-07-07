# Admin Web Dashboard Implementation Plan (Metal Connect)

This document outlines the step-by-step implementation plan for the **Admin Web Dashboard**, which will allow the site owner to manage B2B users, products, and incoming wholesale orders.

## Phase 1: Frontend Setup & Tooling
*   **Initialize Project**: Create a new `web/` directory in the project root using **Vite + React + TypeScript**.
*   **Install Dependencies**: Install `react-router-dom` for navigation, `axios` for API calls, and `lucide-react` for beautiful iconography.
*   **Tailwind CSS Setup**: Configure Tailwind CSS for rapid, modern UI styling.
*   **Deployment Configuration**: Update the main project configuration so that when deployed, the web dashboard is served seamlessly alongside the backend.

## Phase 2: Admin Authentication & Layout
*   **Login View**: Build a secure login page (`/login`) for the admin.
*   **API Integration**: Connect to `POST /api/auth/login`. Ensure we store the auth token and verify that the user has `Role: ADMIN`.
*   **Protected Routes**: Set up React Router so only authenticated admins can access the dashboard.
*   **Admin Layout**: Build a responsive dashboard layout with a persistent sidebar menu (Links: Overview, Users, Products, Orders).

## Phase 3: B2B User Approval (User Management)
*   **Users Table View**: Build a view fetching from `GET /api/users` (Admin only route).
*   **Status Badges**: Display users in a table with clear status badges (`PENDING`, `APPROVED`, `REJECTED`).
*   **Approve/Reject Actions**: Add action buttons that call `PATCH /api/users/:id/status`. This is critical for allowing new businesses to access the wholesale catalog!

## Phase 4: Wholesale Product Management
*   **Products Table View**: Fetch from `GET /api/products`.
*   **Add Product Form**: Create a modal form containing inputs for:
    *   Product Name & Description
    *   Wholesale Price
    *   Minimum Order Quantity (MOQ)
    *   SKU
*   **CRUD Actions**: Wire up API calls to `POST /api/products` (Create), `PATCH` (Update), and `DELETE`.

## Phase 5: Order Management (Fulfillment)
*   **Orders Dashboard**: Build a view fetching from `GET /api/orders`.
*   **Order Details Table**: Display the Order ID, the customer's business name, total amount, and order items.
*   **Status Fulfillment**: Add a dropdown to update the Order Status (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).
*   **API Hookup**: Wire the dropdown to `PATCH /api/orders/:id/status`.

---
*Ready to begin executing this plan!*