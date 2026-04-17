import type { FC } from "hono/jsx";
import type { ViewPasteProps } from "../types";

export const ViewPaste: FC<ViewPasteProps> = ({ id }) => {
  return (
    <div id="view-page">
      <div class="page-header">
        <h1><a href="/">Secure Paste</a></h1>
      </div>
      <input type="hidden" id="paste-id" value={id} />

      {/* Loading state */}
      <div id="loading">
        <div class="loading-dot" />
        <div class="loading-text">Decrypting...</div>
      </div>

      {/* Key missing state */}
      <div id="key-missing" style="display: none;">
        <div class="error-state">
          <div class="error-icon">&#128273;</div>
          <div class="error-message">Decryption key missing</div>
          <div class="error-hint">
            The decryption key wasn't found in the URL. Make sure you have the complete link, including everything after the # symbol.
          </div>
          <a href="/">Create a new paste</a>
        </div>
      </div>

      {/* Password prompt */}
      <div id="password-prompt" style="display: none;">
        <div class="password-card">
          <div class="lock-icon">&#128274;</div>
          <h2>This paste is protected</h2>
          <p class="subtitle">Enter the password to unlock and decrypt</p>
          <input
            type="password"
            id="password-input"
            placeholder="Password"
          />
          <button type="button" id="unlock-btn" class="btn btn-primary btn-full">
            Unlock
          </button>
        </div>
      </div>

      {/* Error state */}
      <div id="error" style="display: none;">
        <div class="error-state">
          <div class="error-icon">&#9888;&#65039;</div>
          <div class="error-message" id="error-message"></div>
          <div class="error-hint" id="error-hint"></div>
          <a href="/">Create a new paste</a>
        </div>
      </div>

      {/* Content display */}
      <div id="content-display" style="display: none;">
        <div id="burn-notice" class="burn-notice" style="display: none;">
          This paste has been destroyed and cannot be viewed again.
        </div>
        <div class="content-card">
          <div class="content-header">
            <span>Decrypted content</span>
            <div class="content-header-actions">
              <button type="button" id="markdown-toggle-btn" class="btn btn-secondary" style="display: none;">Render Markdown</button>
              <button type="button" id="copy-content-btn" class="btn btn-secondary">Copy</button>
            </div>
          </div>
          <div class="content-body">
            <pre><code id="content-code"></code></pre>
            <div id="markdown-rendered" class="markdown-body" style="display: none;"></div>
          </div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="/" style="color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500;">Create a new paste</a>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
    </div>
  );
};
