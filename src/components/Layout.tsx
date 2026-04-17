import type { FC } from "hono/jsx";
import { html, raw } from "hono/html";

interface LayoutProps {
  children: unknown;
  title?: string;
}

const CSS = raw(`
:root {
  --bg-primary: #161618;
  --bg-secondary: #1c1c20;
  --bg-tertiary: #232328;
  --bg-elevated: #2a2a30;
  --text-primary: #ececef;
  --text-secondary: #a0a0ab;
  --text-tertiary: #63636e;
  --text-on-accent: #ffffff;
  --accent: #6c8aff;
  --accent-hover: #8ba3ff;
  --accent-muted: rgba(108, 138, 255, 0.12);
  --accent-border: rgba(108, 138, 255, 0.3);
  --success: #34d399;
  --success-muted: rgba(52, 211, 153, 0.10);
  --success-border: rgba(52, 211, 153, 0.25);
  --warning: #fbbf24;
  --warning-muted: rgba(251, 191, 36, 0.10);
  --warning-border: rgba(251, 191, 36, 0.25);
  --error: #f87171;
  --error-muted: rgba(248, 113, 113, 0.10);
  --error-border: rgba(248, 113, 113, 0.25);
  --border-default: #2a2a30;
  --border-hover: #3a3a42;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter",
               Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "JetBrains Mono", "Fira Code",
               "Droid Sans Mono", Menlo, Consolas, monospace;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  width: 100%;
}
@media (max-width: 640px) { main { padding: 24px 16px; } }

/* Page header */
.page-header { text-align: center; margin-bottom: 40px; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: 6px; }
.page-header h1 a { color: inherit; text-decoration: none; }
.page-header p { font-size: 0.9375rem; color: var(--text-secondary); }

/* Form */
form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group > label { font-size: 13px; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.01em; }
.form-hint { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }

/* Textarea */
textarea {
  width: 100%;
  min-height: 220px;
  padding: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
textarea::placeholder { color: var(--text-tertiary); }
textarea:hover { border-color: var(--border-hover); }
textarea:focus { outline: none; border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-muted); }

/* Inputs & Selects */
input[type="text"],
input[type="password"],
select {
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
input[type="text"]::placeholder,
input[type="password"]::placeholder { color: var(--text-tertiary); }
input[type="text"]:hover,
input[type="password"]:hover,
select:hover { border-color: var(--border-hover); }
input[type="text"]:focus,
input[type="password"]:focus,
select:focus { outline: none; border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-muted); }

select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2363636e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

/* Checkbox */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border-hover);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.1s ease;
  flex-shrink: 0;
}
input[type="checkbox"]:hover { border-color: var(--accent-border); }
input[type="checkbox"]:checked {
  background: var(--accent);
  border-color: var(--accent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

/* Options bar */
.options-bar {
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  padding: 16px; background: var(--bg-secondary);
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
}
.option-group { display: flex; align-items: center; gap: 8px; }
.option-group label { font-size: 13px; color: var(--text-secondary); cursor: pointer; user-select: none; white-space: nowrap; }
.option-group select { width: auto; }
.option-divider { width: 1px; height: 24px; background: var(--border-default); }
@media (max-width: 640px) {
  .options-bar { flex-direction: column; align-items: stretch; }
  .option-divider { display: none; }
  .option-group { justify-content: space-between; }
}

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: var(--font-sans); font-weight: 600; border: none; cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease, color 0.1s ease, border-color 0.1s ease;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

.btn-primary {
  padding: 12px 24px; font-size: 15px; color: var(--text-on-accent);
  background: var(--accent); border-radius: var(--radius-md);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }

.btn-secondary {
  padding: 10px 18px; font-size: 13px; font-weight: 500;
  color: var(--text-primary); background: transparent;
  border: 1px solid var(--border-default); border-radius: var(--radius-md);
}
.btn-secondary:hover:not(:disabled) { background: var(--bg-elevated); border-color: var(--border-hover); }

.btn-full { width: 100%; }

/* Result panel */
#result {
  margin-top: 24px; padding: 24px; background: var(--bg-secondary);
  border: 1px solid var(--success-border); border-radius: var(--radius-xl);
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.result-header { margin-bottom: 16px; }
.result-title { font-size: 17px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.check-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; background: var(--success); color: #fff;
  border-radius: 50%; font-size: 12px; flex-shrink: 0;
}
.result-subtitle { font-size: 13px; color: var(--text-secondary); }

.url-container { display: flex; gap: 8px; }
.url-container input { flex: 1; font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); min-width: 0; }

.result-warning {
  margin-top: 16px; padding: 12px 16px;
  background: var(--warning-muted); border: 1px solid var(--warning-border);
  border-radius: var(--radius-md); font-size: 13px; color: var(--text-secondary); line-height: 1.5;
}

/* Loading */
#loading { text-align: center; padding: 64px 24px; }
.loading-dot {
  display: inline-block; width: 10px; height: 10px;
  background: var(--accent); border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }
.loading-text { margin-top: 16px; font-size: 13px; color: var(--text-secondary); }

/* Password prompt */
.password-card {
  max-width: 400px; margin: 0 auto;
  background: var(--bg-secondary); border: 1px solid var(--border-default);
  border-radius: var(--radius-xl); padding: 32px; text-align: center;
}
.password-card .lock-icon { font-size: 32px; margin-bottom: 16px; opacity: 0.85; }
.password-card h2 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.password-card .subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; }
.password-card input[type="password"] { width: 100%; margin-bottom: 16px; text-align: center; }

/* Error state */
.error-state { max-width: 400px; margin: 0 auto; text-align: center; padding: 32px 24px; }
.error-state .error-icon { font-size: 28px; margin-bottom: 12px; }
.error-state .error-message { font-size: 15px; color: var(--text-primary); margin-bottom: 6px; }
.error-state .error-hint { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; }
.error-state a { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
.error-state a:hover { text-decoration: underline; }

/* Content display */
.content-card {
  background: var(--bg-secondary); border: 1px solid var(--border-default);
  border-radius: var(--radius-lg); overflow: hidden; animation: slideUp 0.3s ease-out;
}
.content-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-default);
}
.content-header span { font-size: 12px; font-weight: 500; color: var(--text-tertiary); letter-spacing: 0.03em; text-transform: uppercase; }
.content-header button { font-size: 12px; padding: 4px 10px; }
.content-header-actions { display: flex; align-items: center; gap: 8px; }
#markdown-toggle-btn.active { background: var(--accent-muted); border-color: var(--accent-border); color: var(--accent); }
.content-body { padding: 20px; overflow-x: auto; max-height: 70vh; overflow-y: auto; }
.content-body pre { margin: 0; background: none; }
.content-body code {
  font-family: var(--font-mono); font-size: 14px; line-height: 1.7;
  color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word;
}

/* Rendered markdown */
.markdown-body { font-family: var(--font-sans); font-size: 15px; line-height: 1.7; color: var(--text-primary); word-wrap: break-word; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  font-weight: 600; color: var(--text-primary); margin-top: 24px; margin-bottom: 12px; line-height: 1.3;
}
.markdown-body h1 { font-size: 1.75em; padding-bottom: 8px; border-bottom: 1px solid var(--border-default); }
.markdown-body h2 { font-size: 1.4em; padding-bottom: 6px; border-bottom: 1px solid var(--border-default); }
.markdown-body h3 { font-size: 1.15em; }
.markdown-body h4 { font-size: 1em; }
.markdown-body h5 { font-size: 0.9em; }
.markdown-body h6 { font-size: 0.85em; color: var(--text-secondary); }
.markdown-body h1:first-child, .markdown-body h2:first-child, .markdown-body h3:first-child { margin-top: 0; }
.markdown-body p { margin-bottom: 16px; }
.markdown-body p:last-child { margin-bottom: 0; }
.markdown-body a { color: var(--accent); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; color: var(--accent-hover); }
.markdown-body strong { font-weight: 600; color: var(--text-primary); }
.markdown-body em { font-style: italic; }
.markdown-body blockquote {
  margin: 0 0 16px 0; padding: 8px 16px;
  border-left: 3px solid var(--accent-border); color: var(--text-secondary);
  background: var(--accent-muted); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.markdown-body blockquote p:last-child { margin-bottom: 0; }
.markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 24px; }
.markdown-body li { margin-bottom: 4px; }
.markdown-body li > ul, .markdown-body li > ol { margin-top: 4px; margin-bottom: 4px; }
.markdown-body code {
  font-family: var(--font-mono); font-size: 0.875em;
  background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px;
  border: 1px solid var(--border-default); color: var(--accent);
}
.markdown-body pre {
  margin-bottom: 16px; padding: 16px; overflow-x: auto;
  background: var(--bg-tertiary); border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}
.markdown-body pre code {
  background: none; border: none; padding: 0; font-size: 14px;
  line-height: 1.7; color: var(--text-primary); border-radius: 0;
}
.markdown-body hr {
  height: 1px; margin: 24px 0; border: none;
  background: var(--border-default);
}
.markdown-body img { max-width: 100%; height: auto; border-radius: var(--radius-md); }
.markdown-body table {
  width: 100%; margin-bottom: 16px; border-collapse: collapse;
  border: 1px solid var(--border-default); border-radius: var(--radius-md);
  overflow: hidden;
}
.markdown-body th, .markdown-body td {
  padding: 8px 14px; text-align: left;
  border: 1px solid var(--border-default);
}
.markdown-body th {
  background: var(--bg-tertiary); font-weight: 600; font-size: 13px;
  text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-secondary);
}
.markdown-body td { font-size: 14px; }
.markdown-body tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }
.markdown-body input[type="checkbox"] { margin-right: 6px; pointer-events: none; }

/* Mermaid diagrams */
.mermaid-block {
  margin-bottom: 16px; padding: 20px; overflow-x: auto;
  background: var(--bg-tertiary); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); text-align: center;
}
.mermaid-block svg { max-width: 100%; height: auto; }
.mermaid-block pre.mermaid { margin: 0; padding: 0; background: none; border: none; text-align: center; }

.burn-notice {
  margin-bottom: 16px; padding: 12px 16px;
  background: var(--warning-muted); border: 1px solid var(--warning-border);
  border-radius: var(--radius-md); font-size: 13px; color: var(--text-secondary); text-align: center;
}

/* Create-page error (simple) */
#create-page #error { text-align: center; padding: 16px; font-size: 13px; color: var(--error); }

/* Footer */
footer { margin-top: 48px; text-align: center; font-size: 12px; color: var(--text-tertiary); padding-bottom: 24px; }
footer a { color: var(--text-secondary); text-decoration: none; }
footer a:hover { color: var(--text-primary); }

.hidden { display: none !important; }
`);

export const Layout: FC<LayoutProps> = ({ children, title = "Secure Paste" }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer" />
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
