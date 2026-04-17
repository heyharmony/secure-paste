# Secure Paste

Secure Paste is a self-hosted paste service on **Cloudflare Workers** using **Hono**. It stores only encrypted blobs in **Cloudflare R2** and serves a small browser app for creating and viewing pastes.

## What the app does
- Create route (`/`) lets users submit plaintext.
- Browser encrypts content before upload.
- Encrypted payload, IV, and optional password metadata are stored in R2 under a generated paste ID.
- View route (`/:id`) renders a page that fetches the stored payload and requires the decryption key in the URL fragment.

## Security model
- **Encryption is client-side only**: content is encrypted with **AES-256-GCM** in the browser.
- The paste server stores ciphertext and metadata, not plaintext.
- Decryption happens in the client after fetching ciphertext.

### Key flow
1. Client generates a fresh AES-256-GCM key and encrypts the paste.
2. Client sends `{ encryptedData, iv, expiresIn, burnAfterRead, passwordHash?, passwordSalt? }` to `POST /api/paste`.
3. Server stores the ciphertext and metadata in R2.
4. Server responds with `{ id, expiresAt }`.
5. Share link is generated as `/{id}#key=<base64url-raw-aes-key>`.
6. Viewer page extracts `#key` from the URL fragment, fetches `GET /api/paste/:id`, then decrypts `data` with `iv` and the key.

## Password protection (PBKDF2 + salt)
- If a password is provided, the client derives a **PBKDF2-SHA-256** hash (100,000 iterations, 16-byte salt) and sends **`passwordHash` + `passwordSalt`** only.
- The server stores these values as metadata and does **access control only**:
  - `/api/paste/:id` returns `401` with `{ salt }` if password is required.
  - Client re-derives and sends `X-Password-Hash`.
  - Server validates using constant-time comparison and returns `403` on mismatch.
- Password is **not** used to encrypt/decrypt content in this implementation; decryption still depends on the URL fragment key.
- Limitation: anyone with valid URL + decryption key can decrypt; protect both.

## Burn-after-read and expiration
- `expiresIn` is enforced by server (`5m`, `15m`, `30m`, `1h`, `1d`, `3d`, `7d`, `30d`).
- Expired pastes are treated as not found and deleted.
- If `burnAfterRead` is true, the paste is deleted after read.

## Local setup
1. `npm install`
2. Copy config: `cp wrangler.toml.example wrangler.toml`
3. Edit `wrangler.toml`:
   - set `PASTE_BUCKET` binding `bucket_name`
   - set `name` / deployment `routes` as needed
4. Run locally: `npm run dev`

> `wrangler.toml` is ignored by git on purpose and should stay out of source control.

## Deployment/configuration
- Requires a Cloudflare R2 bucket bound as `PASTE_BUCKET`.
- Use the same `PASTE_BUCKET` binding name in `wrangler.toml` for the worker.
- The worker serves:
  - API routes from `/api/*`
  - Worker-rendered pages from `/` and `/:id`
  - Static assets from `public/`

## API summary
- `POST /api/paste`
  - Creates a paste.
  - **Request body is already-encrypted content**:
    - `encryptedData` (base64), `iv` (base64), `expiresIn`
    - optional `burnAfterRead`, `passwordHash`, `passwordSalt`
  - Success: `201 { id, expiresAt }`
- `GET /api/paste/:id`
  - Retrieves ciphertext and IV, optionally gated by password hash.
  - Success: `200 { data, iv }` (both base64, still encrypted)
  - Error when password needed: `401 { error: "password_required", salt }`
  - Error on bad password: `403`

## Runtime dependencies loaded on demand
The app does not bundle heavy render-time libs; the viewer loads these from **cdnjs** only when needed:
- `highlight.js`
- `marked`
- `DOMPurify`
- `mermaid`

## Scripts
- `npm run dev` – start local Cloudflare Worker with Wrangler
- `npm run deploy` – deploy the worker
- `npm run typecheck` – run TypeScript typecheck only
