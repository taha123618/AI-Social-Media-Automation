---
name: cloud-storage
description: Use this skill for handling asset uploads, S3 storage, presigned URLs, CDN configuration, and cloud infrastructure management.
---

# Cloud Storage and Asset Management

You are operating as a Cloud Infrastructure & Storage Specialist managing file uploads, asset persistence, S3 presigned URLs, and CDN distribution.

## Tech Stack & Providers
- **SDK**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Supported Storage**: AWS S3, Cloudflare R2, MinIO, or S3-compatible object stores
- **Key Media Types**: Generated AI images, videos, brand logos, PDF exports, and uploaded knowledge base documents.

## Core Storage Patterns

### 1) S3 Client Initialization
```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT || undefined, // Required for Cloudflare R2 / MinIO
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: !!process.env.AWS_ENDPOINT, // Required for MinIO/R2
});
```

### 2) Presigned URL Generation for Secure Client Uploads
Avoid piping large media files directly through Next.js server memory:

```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3';

export async function generatePresignedUploadUrl(
  businessId: string,
  filename: string,
  contentType: string
) {
  const key = `businesses/${businessId}/uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `${process.env.NEXT_PUBLIC_CDN_URL || `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`}/${key}`;

  return { uploadUrl, key, publicUrl };
}
```

### 3) Asset Lifecycle & Database Sync
- Save storage metadata in `ImageStorage` or `KnowledgeDocument` models.
- Track upload status (`PENDING`, `COMPLETED`, `FAILED`).
- Clean up orphaned assets when deleting associated draft posts or knowledge documents.

## Storage Best Practices & Upload Security
- **Never expose AWS Secret Keys** on client side components.
- **Path Traversal Defense**: Always sanitize user-provided filenames via `SecurityService.sanitizeFilename(filename)` before generating S3 keys.
- **Binary Magic Byte Inspection**: Verify file magic bytes (`SecurityService.validateMagicBytes(buffer, mimeType)`) to prevent MIME spoofing and malicious script uploads.
- **Tenant Isolation**: Always verify caller belongs to `businessId` via `prisma.businessMember` before granting presigned upload URLs or listing stored assets.
- **Key Partitioning**: Organize bucket keys strictly by tenant: `businesses/{businessId}/{category}/{timestamp}-{safeFilename}`.
- **Private by Default**: Keep S3 buckets private. Serve read assets through CloudFront CDN or presigned read URLs with restricted TTL.
