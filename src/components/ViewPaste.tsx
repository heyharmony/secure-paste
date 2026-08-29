import type { FC } from "hono/jsx";
import type { ViewPasteProps } from "../types";

export const ViewPaste: FC<ViewPasteProps> = ({ id }) => {
  return (
    <div id="view-page" class="app-shell">
      <header class="app-header">
        <a class="brand" href="/" aria-label="Secure Paste home">Secure Paste</a>
        <span class="local-status"><span aria-hidden="true" /> Decryption stays local</span>
      </header>
      <input type="hidden" id="paste-id" value={id} />

      <div id="loading" class="state-panel" aria-live="polite">
        <span class="loading-indicator" aria-hidden="true" />
        <p id="loading-text">Downloading encrypted content…</p>
      </div>

      <section id="key-missing" class="state-panel" style="display: none;" aria-labelledby="key-missing-title" tabindex={-1}>
        <span class="state-icon" aria-hidden="true">#</span>
        <h1 id="key-missing-title">Decryption key missing</h1>
        <p>The complete URL includes a key after the # symbol. Ask the sender to copy the entire link.</p>
        <a href="/" class="btn btn-secondary">Create a new paste</a>
      </section>

      <section id="password-prompt" class="password-panel" style="display: none;" aria-labelledby="password-title">
        <div class="section-heading compact">
          <p class="eyebrow">Access required</p>
          <h1 id="password-title">Protected paste</h1>
          <p>Enter the password required to retrieve this content.</p>
        </div>

        <form id="password-form">
          <div class="form-group">
            <label for="password-input">Password</label>
            <div class="input-action-row">
              <input
                type="password"
                id="password-input"
                placeholder="Enter password"
                autocomplete="current-password"
                aria-describedby="password-help password-error"
              />
              <button
                type="button"
                id="toggle-view-password"
                class="btn btn-secondary input-action"
                aria-pressed="false"
                aria-label="Show password"
              >
                Show
              </button>
            </div>
            <span id="password-help" class="form-hint">The password controls access to the encrypted content.</span>
            <span id="password-error" class="field-error" style="display: none;" role="alert" />
          </div>
          <button type="submit" id="unlock-btn" class="btn btn-primary btn-full">Unlock paste</button>
        </form>
      </section>

      <section id="error" class="state-panel" style="display: none;" aria-labelledby="error-message" tabindex={-1}>
        <span class="state-icon state-icon-error" aria-hidden="true">!</span>
        <h1 id="error-message">Unable to open paste</h1>
        <p id="error-hint" />
        <a href="/" class="btn btn-secondary">Create a new paste</a>
      </section>

      <section id="content-display" class="content-section" style="display: none;" aria-labelledby="content-title">
        <div class="content-card">
          <div class="content-header">
            <h1 id="content-title" tabindex={-1}>Decrypted content</h1>
            <div class="content-header-actions">
              <div id="view-mode-controls" class="segmented-control" style="display: none;" aria-label="Content view">
                <button type="button" id="plain-text-btn" class="active" aria-pressed="true">Plain</button>
                <button type="button" id="markdown-toggle-btn" aria-pressed="false">Markdown</button>
              </div>
              <button type="button" id="copy-content-btn" class="btn btn-secondary">Copy</button>
            </div>
          </div>
          <p id="content-copy-status" class="status-message content-status" aria-live="polite" />
          <div class="content-body">
            <pre><code id="content-code"></code></pre>
            <div id="markdown-rendered" class="markdown-body" style="display: none;" />
          </div>
        </div>
        <a href="/" class="text-link centered-link">Create another paste</a>
      </section>

    </div>
  );
};
