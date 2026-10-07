import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "proxybuild-media";

const UPLOAD_EXPIRY_SECONDS = 300; // 5 minutes
const DOWNLOAD_EXPIRY_SECONDS = 3600; // 1 hour

export type AllowedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heic"
  | "video/mp4"
  | "video/quicktime"
  | "video/webm"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/msword"
  | "application/vnd.ms-excel";

const MAX_FILE_SIZES: Record<string, number> = {
  image: 20 * 1024 * 1024, // 20MB
  video: 500 * 1024 * 1024, // 500MB
  application: 50 * 1024 * 1024, // 50MB
};

export function validateUpload(
  mimeType: string,
  fileSizeBytes: number
): string | null {
  const allowedTypes: AllowedMimeType[] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
  ];

  if (!allowedTypes.includes(mimeType as AllowedMimeType)) {
    return `File type ${mimeType} is not allowed`;
  }

  const category = mimeType.split("/")[0];
  const maxSize = MAX_FILE_SIZES[category] ?? 50 * 1024 * 1024;
  if (fileSizeBytes > maxSize) {
    return `File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  return null;
}

export async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
  fileSizeBytes: number
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: fileSizeBytes,
  });

  const url = await getSignedUrl(r2, command, {
    expiresIn: UPLOAD_EXPIRY_SECONDS,
  });

  return { url, key };
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(r2, command, { expiresIn: DOWNLOAD_EXPIRY_SECONDS });
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await r2.send(command);
}

export function buildStorageKey(
  projectId: string,
  category: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `projects/${projectId}/${category}/${timestamp}-${sanitized}`;
}
