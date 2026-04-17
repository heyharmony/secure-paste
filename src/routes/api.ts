import { Hono } from "hono";
import type { Bindings, CreatePasteRequest, ExpiresIn } from "../types";
import { savePaste, getPasteMetadata, getPaste, deletePaste, isExpired } from "../storage";
import { verifyPasswordHash, base64Decode, base64Encode } from "../crypto";

export const apiRoutes = new Hono<{ Bindings: Bindings }>();

// Valid expiration options
const validExpiresIn: ExpiresIn[] = ["5m", "15m", "30m", "1h", "1d", "3d", "7d", "30d"];

/**
 * POST /api/paste - Create new paste
 */
apiRoutes.post("/paste", async (c) => {
  let body: CreatePasteRequest;
  
  try {
    body = await c.req.json<CreatePasteRequest>();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }
  
  // Validate required fields
  if (!body.encryptedData || !body.iv || !body.expiresIn) {
    return c.json({ error: "invalid_request" }, 400);
  }
  
  // Validate expiresIn value
  if (!validExpiresIn.includes(body.expiresIn)) {
    return c.json({ error: "invalid_request" }, 400);
  }
  
  // Validate that if passwordHash is present, passwordSalt must also be present
  if (body.passwordHash && !body.passwordSalt) {
    return c.json({ error: "invalid_request" }, 400);
  }
  
  // Decode encrypted data from base64
  let data: Uint8Array;
  try {
    data = base64Decode(body.encryptedData);
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }
  
  // Save to R2
  const { id, expiresAt } = await savePaste(c.env.PASTE_BUCKET, data.buffer as ArrayBuffer, {
    iv: body.iv,
    expiresIn: body.expiresIn,
    burnAfterRead: body.burnAfterRead,
    passwordHash: body.passwordHash,
    passwordSalt: body.passwordSalt,
  });
  
  return c.json({ id, expiresAt: expiresAt.toISOString() }, 201);
});

/**
 * GET /api/paste/:id - Retrieve paste
 */
apiRoutes.get("/paste/:id", async (c) => {
  const id = c.req.param("id");
  const passwordHeader = c.req.header("X-Password-Hash");
  
  // Get metadata first (efficient - no body download)
  const metadata = await getPasteMetadata(c.env.PASTE_BUCKET, id);
  
  if (!metadata) {
    return c.json({ error: "not_found" }, 404);
  }
  
  // Check expiration
  if (isExpired(metadata.expiresAt)) {
    // Delete expired paste asynchronously
    c.executionCtx.waitUntil(deletePaste(c.env.PASTE_BUCKET, id));
    return c.json({ error: "not_found" }, 404);
  }
  
  // Check password if required
  if (metadata.passwordHash) {
    if (!passwordHeader) {
      return c.json({ 
        error: "password_required", 
        salt: metadata.passwordSalt 
      }, 401);
    }
    
    const valid = await verifyPasswordHash(passwordHeader, metadata.passwordHash);
    if (!valid) {
      return c.json({ error: "invalid_password" }, 403);
    }
  }
  
  // Get full paste data
  const paste = await getPaste(c.env.PASTE_BUCKET, id);
  
  if (!paste) {
    return c.json({ error: "not_found" }, 404);
  }
  
  // Handle burn-after-read: delete asynchronously after reading
  if (metadata.burnAfterRead === "true") {
    c.executionCtx.waitUntil(deletePaste(c.env.PASTE_BUCKET, id));
  }
  
  return c.json({
    data: base64Encode(paste.data),
    iv: metadata.iv,
  });
});
