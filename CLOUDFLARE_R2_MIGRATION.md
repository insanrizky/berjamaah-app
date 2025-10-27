# CloudFlare R2 Image API Migration

This document explains the migration from CloudFlare R2 public URLs to API-based image serving.

## Changes Made

### 1. New API Endpoint

- **Created**: `/api/image/[filename]/route.ts`
- **Purpose**: Serves images from CloudFlare R2 through the application API
- **Benefits**:
  - Better security (no direct public access)
  - Consistent caching headers
  - Centralized access control
  - Better error handling

### 2. Updated Upload Endpoint

- **Modified**: `/api/upload/route.ts`
- **Change**: Now returns API endpoint URLs instead of public URLs
- **Format**: `/api/image/{filename}` instead of `https://pub-xxx.r2.dev/{filename}`

### 3. Image URL Utility

- **Created**: `/src/utils/image-url.ts`
- **Purpose**: Converts existing public URLs to API URLs
- **Features**:
  - Handles both old public URLs and new API URLs
  - Backward compatibility for existing data
  - Automatic URL conversion

### 4. Updated UI Components

All image-displaying components now use the `getImageUrl()` utility:

- `src/features/program/program-detail-drawer.tsx`
- `src/features/donation/program-card.tsx`
- `src/features/donation/donation-detail-drawer.tsx`
- `src/features/admin/donation-detail-drawer.tsx`
- `src/features/donation/donation-drawer.tsx`
- `src/features/program/add-program-form.tsx`

### 5. Environment Configuration

- **Removed**: `CLOUDFLARE_R2_PUBLIC_URL` from `.env.example`
- **Updated**: `ENVIRONMENT_VARIABLES.md` documentation
- **Note**: Public URL is no longer needed

## Migration Process

### For New Deployments

1. Deploy the updated code
2. Images uploaded after deployment will automatically use API URLs

### For Existing Deployments

1. Deploy the updated code
2. Run the migration script to convert existing URLs:
   ```bash
   npx ts-node scripts/migrate-image-urls.ts
   ```

## Benefits

1. **Security**: Images are served through your application, allowing for access control
2. **Consistency**: All images use the same URL format
3. **Caching**: Proper cache headers for better performance
4. **Error Handling**: Better error responses for missing images
5. **Monitoring**: Ability to track image access through application logs

## API Endpoint Details

### GET `/api/image/[filename]`

**Parameters:**

- `filename`: The filename/path of the image in R2 storage

**Response:**

- **200**: Image file with appropriate content-type headers
- **404**: Image not found
- **500**: Server error

**Headers:**

- `Content-Type`: Image MIME type (image/jpeg, image/png, etc.)
- `Cache-Control`: `public, max-age=31536000, immutable`
- `Content-Length`: File size in bytes

## Backward Compatibility

The `getImageUrl()` utility function ensures backward compatibility:

- Existing public URLs are automatically converted to API URLs
- New API URLs are returned as-is
- External URLs (not R2) are returned unchanged

This means the migration can be done gradually without breaking existing functionality.
