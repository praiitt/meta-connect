# Implementation Plan: Phase 3 - Image Upload for Products

## Current State
- Products currently use `imageUrl` (text field) for external image URLs
- No file upload functionality exists
- Images are manually entered as URLs in the admin dashboard

## Objective
Replace URL-based product images with direct file uploads from the admin dashboard.

## Technical Approach

### Backend Changes

#### 1. Install Dependencies
```bash
npm install multer @types/multer
```

#### 2. Create Upload Middleware (`backend/src/middleware/upload.ts`)
- Configure multer for disk storage
- Store uploads in `backend/uploads/products/`
- Accept only image formats: jpg, jpeg, png, webp
- Max file size: 5MB
- Generate unique filenames using timestamp + original name

#### 3. Add Static File Serving (`backend/src/index.ts`)
- Serve `/uploads` directory as static files
- Route: `/uploads/products/:filename`

#### 4. Update Product Routes (`backend/src/routes/products.ts`)
- Add new endpoint: `POST /api/products/upload-image`
  - Protected with `authenticate` + `requireAdmin`
  - Uses multer middleware
  - Returns uploaded file URL
- Modify existing `POST /products` and `PATCH /products/:id`
  - Accept both `imageUrl` (URL string) and uploaded files
  - Save relative path in database: `/uploads/products/filename.jpg`

### Frontend Changes (Web Admin Dashboard)

#### 1. Update Products Page (`web/src/pages/Products.tsx`)
- Add file input field to the modal form
- Replace text input for `imageUrl` with:
  - File upload button
  - Image preview (if file selected or existing URL)
  - Option to remove image
- On submit:
  - If new file selected, upload it first via `POST /api/products/upload-image`
  - Use returned URL in product creation/update payload

#### 2. API Client Enhancement (`web/src/api/client.ts`)
- Add helper function for multipart/form-data uploads

### Mobile App Changes

#### No changes required
- Mobile app already displays images from URLs
- Backend will serve uploaded images as static files
- Existing `imageUrl` field will contain the uploaded file path

## Database Schema
**No migration needed** — the existing `imageUrl` field can store both external URLs and local paths.

## Testing Plan
1. Upload a product image from admin dashboard
2. Verify file is saved in `backend/uploads/products/`
3. Verify product record contains correct path
4. Verify image displays correctly in:
   - Admin products list
   - Mobile catalog screen
   - Mobile product detail (when implemented)
5. Test editing product and replacing image
6. Test deleting old image when new one is uploaded

## File Structure
```
backend/
├── src/
│   ├── middleware/
│   │   └── upload.ts          # NEW
│   ├── routes/
│   │   └── products.ts        # MODIFY
│   └── index.ts               # MODIFY (add static serving)
├── uploads/                   # NEW (gitignored)
│   └── products/
│       └── [uploaded images]
web/
└── src/
    └── pages/
        └── Products.tsx       # MODIFY (add file upload UI)
```

## Estimated Time
- Backend: 1 hour
- Frontend (Web): 1 hour
- Testing: 30 minutes
**Total: 2.5 hours**

## Next Steps
1. Implement backend upload middleware
2. Update backend product routes
3. Update web admin UI for file uploads
4. Test end-to-end flow
5. Git commit and push changes
