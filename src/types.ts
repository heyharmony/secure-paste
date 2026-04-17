// Cloudflare Workers environment bindings
export type Bindings = {
  PASTE_BUCKET: R2Bucket;
};

// R2 custom metadata structure (all values are strings - R2 limitation)
export interface PasteMetadata {
  expiresAt: string;        // ISO 8601 timestamp
  burnAfterRead: string;    // "true" | "false"
  iv: string;               // Base64-encoded IV (12 bytes)
  passwordHash?: string;    // Base64-encoded PBKDF2 hash (optional)
  passwordSalt?: string;    // Base64-encoded salt (optional, required if hash present)
}

// POST /api/paste request body
export interface CreatePasteRequest {
  encryptedData: string;    // Base64-encoded ciphertext
  iv: string;               // Base64-encoded IV
  expiresIn: ExpiresIn;     // TTL option
  burnAfterRead?: boolean;  // Optional, defaults to false
  passwordHash?: string;    // Base64-encoded hash (optional)
  passwordSalt?: string;    // Base64-encoded salt (optional)
}

// POST /api/paste response (201)
export interface CreatePasteResponse {
  id: string;               // UUID v4
  expiresAt: string;        // ISO 8601 timestamp
}

// GET /api/paste/:id response (200)
export interface GetPasteResponse {
  data: string;             // Base64-encoded ciphertext
  iv: string;               // Base64-encoded IV
}

// GET /api/paste/:id response (401) - password required
export interface PasswordRequiredResponse {
  error: "password_required";
  salt: string;             // Base64-encoded salt
}

// Error responses
export interface ErrorResponse {
  error: "invalid_request" | "not_found" | "invalid_password" | "password_required";
  salt?: string;            // Only for password_required
}

// Expiration options
export type ExpiresIn = "5m" | "15m" | "30m" | "1h" | "1d" | "3d" | "7d" | "30d";

// Options for savePaste function
export interface SavePasteOptions {
  iv: string;
  expiresIn: ExpiresIn;
  burnAfterRead?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
}

// Result from getPaste function
export interface PasteRecord {
  data: ArrayBuffer;
  metadata: PasteMetadata;
}

// Component props
export interface LayoutProps {
  children: unknown;
  title?: string;
}

export interface ViewPasteProps {
  id: string;
}
