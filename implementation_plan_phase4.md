# Implementation Plan: Phase 4 - Push Notifications

## Objective
Implement push notifications using Expo Push Notifications to notify users about order status updates and new products.

## Tasks

### Part 1: Database & Backend Utilities
1. **Schema Update**: Add `pushToken String?` to the `User` model in `backend/prisma/schema.prisma`.
2. **Migration**: Run `npx prisma db push` (or `npx prisma migrate dev`).
3. **Dependencies**: Install `expo-server-sdk` in the backend.
4. **Push Utility**: Create `backend/src/utils/notifications.ts` with helper functions to send Expo push notifications.
5. **Routes**:
   - Update `backend/src/routes/users.ts` to add a `POST /api/users/register-push-token` route.
   - Update `backend/src/routes/orders.ts` to send a notification when an order status changes.
   - Update `backend/src/routes/products.ts` to add a trigger for new product notifications.

### Part 2: Mobile App
1. **Dependencies**: Install `expo-notifications` and `expo-device`.
2. **App Config**: Add `"expo-notifications"` to `app.json` plugins.
3. **Push Token Logic**: Update `store/useAuthStore.ts` or create a new hook to request notification permissions and fetch the Expo Push Token.
4. **API Call**: Send the push token to `/api/users/register-push-token` after successful login or app startup.
5. **Listeners**: Add notification listeners to handle foreground notifications.

### Part 3: Admin Web Dashboard
1. Add a UI button/checkbox when updating order status to trigger a notification.
2. Add a "Notify Retailers" toggle when creating a new product.

## Execution Strategy
I will execute Part 1 first, then pause for verification or continue to Part 2.
