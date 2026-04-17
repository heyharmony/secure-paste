/**
 * Decode Base64 string to Uint8Array
 */
export function base64Decode(str: string): Uint8Array {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode ArrayBuffer to Base64 string
 */
export function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

/**
 * Timing-safe password hash comparison
 * Uses crypto.subtle.timingSafeEqual() to prevent timing attacks
 */
export async function verifyPasswordHash(
  providedHash: string,
  storedHash: string
): Promise<boolean> {
  let provided: Uint8Array;
  let stored: Uint8Array;

  try {
    provided = base64Decode(providedHash);
    stored = base64Decode(storedHash);
  } catch {
    // Invalid base64 input — still perform a dummy comparison for constant time
    try {
      const storedBytes = base64Decode(storedHash);
      const dummy = new Uint8Array(storedBytes.length);
      crypto.subtle.timingSafeEqual(dummy, storedBytes);
    } catch {
      // storedHash also invalid — nothing to compare
    }
    return false;
  }
  
  // Handle length mismatch safely - still do a comparison to maintain constant time
  if (provided.length !== stored.length) {
    const dummy = new Uint8Array(stored.length);
    crypto.subtle.timingSafeEqual(dummy, stored);
    return false;
  }
  
  // Constant-time comparison
  return crypto.subtle.timingSafeEqual(provided, stored);
}
