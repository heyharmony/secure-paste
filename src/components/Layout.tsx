import type { FC } from "hono/jsx";
import { raw } from "hono/html";

interface LayoutProps {
  children: unknown;
  title?: string;
}

const CSS = raw(`
/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
/* Hallmark · macrostructure: Workbench · genre: modern-minimal · theme: Harmony-2026 · enrichment: none */
:root {
  color-scheme: light;
  --surface-page: #ffffff;
  --surface-canvas: #ffffff;
  --surface-sidebar: #f5f5f5;
  --surface-input: #ffffff;
  --surface-chip: #0000000f;
  --surface-chip-subtle: #0000000a;
  --surface-chip-strong: #00000026;
  --surface-chip-hover: #0000001a;
  --text-primary: #0a0a0a;
  --text-secondary: #3a3a3a;
  --text-tertiary: #6b6b6b;
  --text-muted: #9a9a9a;
  --text-disabled: #bcbcbc;
  --text-inverse: #ffffff;
  --border-subtle: #0000001a;
  --border-default: #00000014;
  --border-strong: #00000040;
  --border-focus: #2f6feb;
  --cta-bg: #0a0a0a;
  --cta-fg: #ffffff;
  --cta-hover: #3a3a3a;
  --cta-active: #525252;
  --brand-accent: #f47d2d;
  --success-fg: oklch(0.55 0.16 149.7);
  --success-bg: oklch(0.945 0.06 155);
  --success-border: oklch(0.7 0.12 155);
  --warning-fg: oklch(0.48 0.15 75);
  --warning-bg: oklch(0.95 0.06 85);
  --warning-border: oklch(0.75 0.12 85);
  --error-fg: oklch(0.55 0.2 25.4);
  --error-bg: oklch(0.935 0.04 25);
  --error-border: oklch(0.65 0.15 25);
  --shadow-0: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-1: 0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.06);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --surface-page: #212121;
    --surface-canvas: #252525;
    --surface-sidebar: #252525;
    --surface-input: #2c2c2c;
    --surface-chip: #ffffff0f;
    --surface-chip-subtle: #ffffff0d;
    --surface-chip-strong: #ffffff26;
    --surface-chip-hover: #ffffff38;
    --text-primary: #ffffff;
    --text-secondary: #ffffffc7;
    --text-tertiary: #ffffff8c;
    --text-muted: #ffffff66;
    --text-disabled: #ffffff4d;
    --text-inverse: #0a0a0a;
    --border-subtle: #ffffff0a;
    --border-default: #ffffff14;
    --border-strong: #ffffff40;
    --border-focus: #5c9dff;
    --cta-bg: #ffffff;
    --cta-fg: #0a0a0a;
    --cta-hover: #e6e6e6;
    --cta-active: #d1d1d1;
    --brand-accent: #bd7234;
    --success-fg: oklch(0.72 0.192 149.5);
    --success-bg: oklch(0.22 0.04 155);
    --success-border: oklch(0.5 0.1 155);
    --warning-fg: oklch(0.77 0.1645 70.6);
    --warning-bg: oklch(0.23 0.04 85);
    --warning-border: oklch(0.55 0.1 85);
    --error-fg: oklch(0.72 0.16 25.4);
    --error-bg: oklch(0.22 0.035 25);
    --error-border: oklch(0.45 0.12 25);
    --shadow-0: 0 1px 2px oklch(0 0 0 / 0.2);
    --shadow-1: 0 1px 3px oklch(0 0 0 / 0.3), 0 1px 2px oklch(0 0 0 / 0.2);
  }
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; min-width: 0; overflow-x: clip; }
body {
  min-height: 100dvh;
  background: var(--surface-page);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  font-feature-settings: "rlig" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
}
button, input, select, textarea { font: inherit; }
a { color: inherit; }

main {
  width: min(100%, 68rem);
  margin-inline: auto;
  padding: max(1.25rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
}

.app-shell { min-width: 0; }
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.75rem;
  margin-bottom: clamp(2rem, 7vw, 4.5rem);
}
.brand {
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
}
.local-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  white-space: nowrap;
}
.local-status > span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--brand-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-accent) 16%, transparent);
}

.workspace { min-width: 0; }
.section-heading { max-width: 38rem; margin-bottom: 2rem; }
.section-heading.compact { margin-bottom: 1.5rem; }
.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1, h2 { color: var(--text-primary); font-style: normal; overflow-wrap: anywhere; min-width: 0; }
.section-heading h1 {
  margin: 0;
  font-size: clamp(1.75rem, 7vw, 2.5rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
  font-weight: 650;
}
.section-heading > p:last-child {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
  max-width: 34rem;
}

form { display: grid; gap: 1.5rem; }
.form-group { display: grid; gap: 0.5rem; min-width: 0; }
.form-group > label, .group-heading {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 550;
}
.group-heading { margin: 0; }
.form-hint, .field-error {
  min-height: 1.25rem;
  color: var(--text-tertiary);
  font-size: 0.75rem;
}
.field-error { color: var(--error-fg); }

textarea, input[type="text"], input[type="password"], select {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--border-default);
  outline: 2px solid transparent;
  outline-offset: 1px;
  background: var(--surface-input);
  color: var(--text-primary);
  box-shadow: var(--shadow-0);
  transition: background-color 60ms ease-out, border-color 60ms ease-out;
}
input[type="text"], input[type="password"], select {
  min-height: 2.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
}
textarea {
  min-height: clamp(14rem, 40dvh, 24rem);
  padding: 1rem;
  resize: vertical;
  border-radius: var(--radius-lg);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.65;
}
textarea::placeholder, input::placeholder { color: var(--text-muted); }
select { cursor: pointer; }

.settings-grid { display: grid; gap: 1.5rem; }
.access-controls {
  display: grid;
  gap: 1.25rem;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-sidebar);
}
.checkbox-row {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
  cursor: pointer;
}
.checkbox-row input {
  width: 1.125rem;
  height: 1.125rem;
  margin: 0.15rem 0 0;
  accent-color: var(--cta-bg);
}
.checkbox-row span { display: grid; gap: 0.125rem; }
.checkbox-row strong { color: var(--text-primary); font-size: 0.875rem; font-weight: 550; }
.checkbox-row small { color: var(--text-tertiary); font-size: 0.75rem; }
.input-action-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.5rem; }

.btn {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  outline: 2px solid transparent;
  outline-offset: 1px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 550;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 80ms ease-out, border-color 80ms ease-out, color 80ms ease-out;
}
.btn-primary { background: var(--cta-bg); color: var(--cta-fg); border-color: var(--cta-bg); }
.btn-secondary { background: var(--surface-input); color: var(--text-secondary); border-color: var(--border-default); }
.btn-full { width: 100%; }
.input-action { min-width: 4.25rem; padding-inline: 0.75rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.submit-area {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.25rem;
}
.submit-area .btn { width: 100%; }

.result-panel, .password-panel, .content-card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-canvas);
  box-shadow: var(--shadow-1);
}
.result-panel { margin-top: 1.5rem; padding: clamp(1rem, 4vw, 1.5rem); }
.result-heading { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
.result-heading h2 { margin: 0; font-size: 1rem; font-weight: 600; }
.result-heading p { margin: 0.25rem 0 0; color: var(--text-tertiary); font-size: 0.8125rem; }
.state-icon {
  display: inline-grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border-default);
  border-radius: 50%;
  background: var(--surface-chip);
  color: var(--text-secondary);
  font-weight: 650;
}
.state-icon-success { background: var(--success-bg); color: var(--success-fg); border-color: var(--success-border); }
.state-icon-error { background: var(--error-bg); color: var(--error-fg); border-color: var(--error-border); }
.url-container { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.5rem; }
.url-container input { font-family: var(--font-mono); font-size: 0.75rem; }
.status-message { min-height: 1.25rem; margin: 0.375rem 0 0; color: var(--text-tertiary); font-size: 0.75rem; }
.result-meta { display: grid; gap: 0; margin: 1rem 0; border-block: 1px solid var(--border-subtle); }
.result-meta > div { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 0.75rem; padding-block: 0.625rem; }
.result-meta > div + div { border-top: 1px solid var(--border-subtle); }
.result-meta dt { color: var(--text-tertiary); font-size: 0.75rem; }
.result-meta dd { margin: 0; color: var(--text-secondary); font-size: 0.8125rem; text-align: end; }
.result-warning {
  margin: 0 0 1rem;
  padding: 0.75rem;
  border: 1px solid var(--warning-border);
  border-radius: var(--radius-md);
  background: var(--warning-bg);
  color: var(--warning-fg);
  font-size: 0.8125rem;
}
.text-link { color: var(--text-secondary); font-size: 0.8125rem; font-weight: 550; text-underline-offset: 0.2em; white-space: nowrap; }
.centered-link { display: block; width: fit-content; margin: 1.25rem auto 0; }
.inline-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--error-border);
  border-radius: var(--radius-md);
  background: var(--error-bg);
  color: var(--error-fg);
  font-size: 0.8125rem;
}

.state-panel {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  max-width: 30rem;
  margin: clamp(4rem, 18dvh, 9rem) auto 0;
  padding: 1.5rem;
  text-align: center;
}
.state-panel h1 { margin: 0; font-size: 1.25rem; letter-spacing: -0.025em; }
.state-panel p { max-width: 28rem; margin: 0; color: var(--text-secondary); }
.loading-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--brand-accent);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.35; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
.password-panel { max-width: 30rem; margin: clamp(2rem, 10dvh, 6rem) auto 0; padding: clamp(1.25rem, 5vw, 2rem); }

.content-section { min-width: 0; }
.content-card { overflow: clip; }
.content-header {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-sidebar);
}
.content-header h1 { margin: 0; font-size: 0.875rem; font-weight: 600; }
.content-header-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.segmented-control {
  display: inline-flex;
  padding: 0.1875rem;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-chip);
}
.segmented-control button {
  min-height: 2.25rem;
  padding: 0.375rem 0.625rem;
  border: 0;
  border-radius: var(--radius-sm);
  outline: 2px solid transparent;
  outline-offset: 1px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 550;
  white-space: nowrap;
}
.segmented-control button.active { background: var(--surface-input); color: var(--text-primary); box-shadow: var(--shadow-0); }
.content-status { margin: 0; padding-inline: 0.75rem; background: var(--surface-sidebar); }
.content-body { max-height: 72dvh; min-width: 0; overflow: auto; padding: clamp(1rem, 4vw, 1.5rem); }
.content-body pre { margin: 0; background: none; }
.content-body code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-primary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.hljs { color: var(--text-primary); background: transparent; }
.hljs-comment, .hljs-quote { color: var(--text-tertiary); }
.hljs-keyword, .hljs-selector-tag, .hljs-type, .hljs-meta { color: var(--border-focus); }
.hljs-string, .hljs-attribute, .hljs-template-tag, .hljs-template-variable { color: var(--success-fg); }
.hljs-number, .hljs-literal, .hljs-symbol, .hljs-bullet { color: var(--warning-fg); }
.hljs-title, .hljs-section, .hljs-selector-id, .hljs-selector-class { color: var(--brand-accent); }
.hljs-variable, .hljs-params, .hljs-built_in { color: var(--text-secondary); }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 650; }

.markdown-body { color: var(--text-primary); font-size: 0.9375rem; line-height: 1.7; overflow-wrap: anywhere; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin: 1.5rem 0 0.75rem;
  color: var(--text-primary);
  font-style: normal;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 1.75rem; }
.markdown-body h2 { font-size: 1.4rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem; }
.markdown-body h3 { font-size: 1.15rem; }
.markdown-body p { margin: 0 0 1rem; }
.markdown-body a { color: var(--border-focus); text-underline-offset: 0.2em; }
.markdown-body blockquote { margin: 0 0 1rem; padding: 0.75rem 1rem; border-left: 3px solid var(--border-strong); background: var(--surface-sidebar); color: var(--text-secondary); }
.markdown-body ul, .markdown-body ol { margin: 0 0 1rem; padding-inline-start: 1.5rem; }
.markdown-body code { padding: 0.125rem 0.375rem; border: 1px solid var(--border-default); border-radius: 4px; background: var(--surface-sidebar); }
.markdown-body pre { margin: 0 0 1rem; padding: 1rem; overflow: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-sidebar); }
.markdown-body pre code { padding: 0; border: 0; background: none; }
.markdown-body hr { height: 1px; margin: 1.5rem 0; border: 0; background: var(--border-default); }
.markdown-body img { max-width: 100%; height: auto; border-radius: var(--radius-md); }
.markdown-body table { display: block; width: 100%; margin-bottom: 1rem; overflow-x: auto; border-collapse: collapse; }
.markdown-body th, .markdown-body td { padding: 0.5rem 0.75rem; border: 1px solid var(--border-default); text-align: start; }
.markdown-body th { background: var(--surface-sidebar); color: var(--text-secondary); font-size: 0.8125rem; }
.markdown-body input[type="checkbox"] { margin-inline-end: 0.375rem; pointer-events: none; }
.mermaid-block { margin-bottom: 1rem; padding: 1rem; overflow-x: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-sidebar); text-align: center; }
.mermaid-block svg { max-width: 100%; height: auto; }
.mermaid-block pre.mermaid { margin: 0; padding: 0; border: 0; background: none; }

:focus { outline: none; }
:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 1px;
}
input[aria-invalid="true"] { border-color: var(--error-border); }
.result-panel:focus-visible, .state-panel:focus-visible, #content-title:focus-visible, .inline-error:focus-visible { outline: none; }

@media (hover: hover) and (pointer: fine) {
  .brand:hover, .text-link:hover { color: var(--text-primary); }
  textarea:hover, input[type="text"]:hover, input[type="password"]:hover, select:hover { background: var(--surface-chip-subtle); border-color: var(--border-strong); }
  .btn-primary:hover:not(:disabled) { background: var(--cta-hover); border-color: var(--cta-hover); }
  .btn-secondary:hover:not(:disabled), .segmented-control button:hover { background: var(--surface-chip-hover); color: var(--text-primary); border-color: var(--border-strong); }
}
.btn-primary:active:not(:disabled) { background: var(--cta-active); border-color: var(--cta-active); }
.btn-secondary:active:not(:disabled) { background: var(--surface-chip-strong); }

@media (min-width: 40rem) {
  main {
    padding-inline-start: max(1.5rem, env(safe-area-inset-left));
    padding-inline-end: max(1.5rem, env(safe-area-inset-right));
  }
  .settings-grid { grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr); align-items: start; }
  .submit-area .btn { width: auto; }
  .content-header { grid-template-columns: minmax(0, 1fr) auto; align-items: center; padding: 0.75rem 1rem; }
  .content-header-actions { justify-content: flex-end; }
}

@media (max-width: 24rem) {
  .url-container { grid-template-columns: 1fr; }
  .url-container .btn { width: 100%; }
  .content-header-actions { display: grid; grid-template-columns: 1fr; }
  .segmented-control { width: 100%; }
  .segmented-control button { flex: 1; }
}

@media (pointer: coarse) {
  .btn, input[type="text"], input[type="password"], select { min-height: 2.75rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`);

export const Layout: FC<LayoutProps> = ({ children, title = "Secure Paste" }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="referrer" content="no-referrer" />
        <meta name="color-scheme" content="light dark" />
        <title>{title}</title>
        <style>{CSS}</style>
      </head>
      <body>
        <main>{children}</main>
        <script src="/client.js" defer />
      </body>
    </html>
  );
};
