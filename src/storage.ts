import type { ExpiresIn, PasteMetadata, PasteRecord, SavePasteOptions } from "./types";

/**
 * Calculate expiration date from TTL option
 */
export function calculateExpiry(expiresIn: ExpiresIn): Date {
  const now = new Date();
  
  switch (expiresIn) {
    case "5m":
      return new Date(now.getTime() + 5 * 60 * 1000);
    case "15m":
      return new Date(now.getTime() + 15 * 60 * 1000);
    case "30m":
      return new Date(now.getTime() + 30 * 60 * 1000);
    case "1h":
      return new Date(now.getTime() + 1 * 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "3d":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      // Default to 1 day if invalid
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Check if paste is expired
 */
export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Save a new paste to R2
 */
export async function savePaste(
  bucket: R2Bucket,
  data: ArrayBuffer,
  options: SavePasteOptions
): Promise<{ id: string; expiresAt: Date }> {
  const id = crypto.randomUUID();
  const expiresAt = calculateExpiry(options.expiresIn);
  
  const customMetadata: Record<string, string> = {
    expiresAt: expiresAt.toISOString(),
    burnAfterRead: String(options.burnAfterRead ?? false),
    iv: options.iv,
  };
  
  // Only include password fields if password protection enabled
  if (options.passwordHash && options.passwordSalt) {
    customMetadata.passwordHash = options.passwordHash;
    customMetadata.passwordSalt = options.passwordSalt;
  }
  
  await bucket.put(id, data, {
    httpMetadata: { contentType: "application/octet-stream" },
    customMetadata,
  });
  
  return { id, expiresAt };
}

/**
 * Retrieve paste metadata only (for password check) using bucket.head()
 */
export async function getPasteMetadata(
  bucket: R2Bucket,
  id: string
): Promise<PasteMetadata | null> {
  const object = await bucket.head(id);
  
  if (!object) {
    return null;
  }
  
  return object.customMetadata as unknown as PasteMetadata;
}

/**
 * Retrieve full paste (metadata + encrypted data)
 */
export async function getPaste(
  bucket: R2Bucket,
  id: string
): Promise<PasteRecord | null> {
  const object = await bucket.get(id);
  
  if (!object) {
    return null;
  }
  
  const metadata = object.customMetadata as unknown as PasteMetadata;
  
  // Check expiration and delete if expired
  if (isExpired(metadata.expiresAt)) {
    await bucket.delete(id);
    return null;
  }
  
  const data = await object.arrayBuffer();
  
  return {
    data,
    metadata,
  };
}

/**
 * Delete a paste (for burn-after-read)
 */
export async function deletePaste(
  bucket: R2Bucket,
  id: string
): Promise<void> {
  await bucket.delete(id);
}
