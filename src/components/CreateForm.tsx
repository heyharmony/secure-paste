import type { FC } from "hono/jsx";

export const CreateForm: FC = () => {
  return (
    <div id="create-page">
      <div class="page-header">
        <h1>Secure Paste</h1>
        <p>Share sensitive content with end-to-end encryption</p>
      </div>

      <form id="create-form">
        <div class="form-group">
          <label for="content">Content</label>
          <textarea
            id="content"
            placeholder="Paste your secret content here..."
            required
          />
        </div>

        <div class="options-bar">
          <div class="option-group">
            <label for="expires-in">Expires in</label>
            <select id="expires-in">
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="1d">1 day</option>
              <option value="3d" selected>3 days</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>

          <div class="option-divider" />

          <div class="option-group">
            <input type="checkbox" id="burn-after-read" />
            <label for="burn-after-read">Burn after reading</label>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password protection</label>
          <input
            type="password"
            id="password"
            placeholder="Optional — leave empty for no password"
          />
          <span class="form-hint">Adds an extra layer of access control before decryption</span>
        </div>

        <button type="submit" id="create-btn" class="btn btn-primary btn-full">
          Create secure link
        </button>
      </form>

      <div id="result" style="display: none;">
        <div class="result-header">
          <div class="result-title">
            <span class="check-icon">&#10003;</span>
            Your secure link is ready
          </div>
          <div class="result-subtitle">Anyone with this link can decrypt and view the content</div>
        </div>
        <div class="url-container">
          <input type="text" id="share-url" readonly />
          <button type="button" id="copy-btn" class="btn btn-secondary">Copy link</button>
        </div>
        <div class="result-warning">
          This link contains the decryption key. Save it now — it won't be shown again.
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <a href="/" style="color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500;">Create another paste</a>
        </div>
      </div>

      <div id="error" style="display: none;"></div>

      <footer>
        <p>All content is encrypted in your browser with AES-256-GCM. The server never sees your data.</p>
      </footer>
    </div>
  );
};
