# Implementation Plan: Invite-Only Retailer Login Flow

## Overview
The user wants to transition from self-registration to an admin-managed invite system for retailers. The admin adds the retailer (with GST and mobile number), the system generates a unique login code, and the retailer logs in using their mobile number and this code.

## Steps to Implement

### 1. Database Schema Updates (`backend/prisma/schema.prisma`)
*   Add `gst String?` to the `User` model.
*   Update `phone String?` to `phone String? @unique` to allow querying by mobile number during login.
*   *Note:* The `password` field will be reused to store the hashed version of the generated "code".

### 2. Backend API Updates (`backend/src/routes/auth.ts` & `users.ts`)
*   **Admin Route (`POST /api/users/invite`)**:
    *   Protected by Admin middleware.
    *   Accepts `phone`, `gst`, `name`, `company`.
    *   Generates a random 6-digit login code (e.g., `482910`).
    *   Hashes the code and creates the user with `status: APPROVED`.
    *   Returns the raw code in the response so the admin/wholesaler can share it with the retailer.
*   **Login Route (`POST /api/auth/login`)**:
    *   Modify to accept `phone` and `code` (alongside or replacing `email`/`password`).
    *   Authenticate the user based on their mobile number and the provided code.

### 3. Frontend Mobile App Updates (Expo)
*   **Login Screen (`app/(auth)/login.tsx`)**:
    *   Change inputs from Email/Password to Mobile Number and Login Code.
    *   Update the API call payload to send `{ phone, code }` instead of `{ email, password }`.
*   **Registration Flow**:
    *   Remove or hide the `register.tsx` screen, as retailers are now exclusively invited by the wholesaler/admin.

### 4. Deployment
*   Run Prisma migrations on the development database.
*   Deploy the backend changes to the dev server.
*   Ensure the frontend uses the updated login mechanism.
