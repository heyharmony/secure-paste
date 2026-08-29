import type { FC } from "hono/jsx";

export const CreateForm: FC = () => {
  return (
    <div id="create-page" class="app-shell">
      <header class="app-header">
        <a class="brand" href="/" aria-label="Secure Paste home">Secure Paste</a>
      </header>

      <section class="workspace" aria-labelledby="create-title">
        <div class="section-heading">
          <p class="eyebrow">Private by design</p>
          <h1 id="create-title">Share encrypted content</h1>
          <p>Content is encrypted in this browser before it is uploaded.</p>
        </div>

        <form id="create-form">
          <div class="form-group editor-group">
            <label for="content">Content</label>
            <textarea
              id="content"
              placeholder="Paste private content…"
              required
            />
          </div>

          <div class="settings-grid">
            <div class="form-group">
              <label for="expires-in">Expiration</label>
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

            <div class="access-controls" role="group" aria-labelledby="access-controls-title">
              <h2 id="access-controls-title" class="group-heading">Access controls</h2>
              <label class="checkbox-row" for="burn-after-read">
                <input type="checkbox" id="burn-after-read" />
                <span>
                  <strong>Delete after retrieval</strong>
                  <small>Schedule deletion after the content is opened.</small>
                </span>
              </label>

              <div class="form-group password-group">
                <label for="password">Password</label>
                <div class="input-action-row">
                  <input
                    type="password"
                    id="password"
                    placeholder="Optional password"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    id="toggle-create-password"
                    class="btn btn-secondary input-action"
                    aria-pressed="false"
                    aria-label="Show password"
                  >
                    Show
                  </button>
                </div>
                <span class="form-hint">Requires a password before the encrypted content can be downloaded.</span>
              </div>
            </div>
          </div>

          <div class="submit-area">
            <button type="submit" id="create-btn" class="btn btn-primary">
              Encrypt and create link
            </button>
          </div>
        </form>

        <section id="result" class="result-panel" style="display: none;" aria-labelledby="result-title" tabindex={-1}>
          <div class="result-heading">
            <span class="state-icon state-icon-success" aria-hidden="true">✓</span>
            <div>
              <h2 id="result-title">Secure link created</h2>
              <p>Copy the complete link before leaving this page.</p>
            </div>
          </div>

          <div class="url-container">
            <input type="text" id="share-url" readonly aria-label="Secure paste link" />
            <button type="button" id="copy-btn" class="btn btn-primary">Copy link</button>
          </div>
          <p id="create-copy-status" class="status-message" aria-live="polite" />

          <dl class="result-meta">
            <div><dt>Expires</dt><dd id="result-expires">—</dd></div>
            <div><dt>Password</dt><dd id="result-password">—</dd></div>
            <div><dt>Deletion</dt><dd id="result-burn">—</dd></div>
          </dl>

          <p class="result-warning">
            The complete URL contains the decryption key. Anyone with it can decrypt the content.
          </p>

          <a href="/" class="text-link">Create another paste</a>
        </section>

        <div id="error" class="inline-error" style="display: none;" role="alert" tabindex={-1} />
      </section>
    </div>
  );
};
