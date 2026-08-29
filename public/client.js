(function() {
  "use strict";

  // === Base64 Encoding Functions ===

  function base64Encode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
  }

  function base64Decode(str) {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function base64urlEncode(buffer) {
    const base64 = base64Encode(buffer);
    return base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function base64urlDecode(str) {
    let base64 = str
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    base64 += "=".repeat(padLength);
    return base64Decode(base64);
  }

  // === Crypto Functions ===

  async function generateKey() {
    return await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async function exportKey(key) {
    return await crypto.subtle.exportKey("raw", key);
  }

  async function importKey(rawKey) {
    return await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
  }

  async function encrypt(plaintext, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return { ciphertext, iv };
  }

  async function decrypt(ciphertext, iv, key) {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  }

  function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  async function derivePasswordHash(password, salt) {
    const encoder = new TextEncoder();

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const hashBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      256
    );

    return hashBits;
  }

  // === UI Helper Functions ===

  function showError(message, hint) {
    var el;
    el = document.getElementById("loading");
    if (el) el.style.display = "none";
    el = document.getElementById("key-missing");
    if (el) el.style.display = "none";
    el = document.getElementById("password-prompt");
    if (el) el.style.display = "none";
    el = document.getElementById("content-display");
    if (el) el.style.display = "none";

    var errorEl = document.getElementById("error");
    if (!errorEl) return;

    var msgEl = document.getElementById("error-message");
    var hintEl = document.getElementById("error-hint");
    if (msgEl && hintEl) {
      msgEl.textContent = message;
      hintEl.textContent = hint || "";
    } else {
      errorEl.textContent = message;
    }

    errorEl.style.display = errorEl.classList.contains("state-panel") ? "grid" : "block";
    errorEl.focus();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  }

  function bindPasswordToggle(buttonId, inputId) {
    var button = document.getElementById(buttonId);
    var input = document.getElementById(inputId);
    if (!button || !input) return;

    button.addEventListener("click", function() {
      var reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Hide" : "Show";
      button.setAttribute("aria-pressed", reveal ? "true" : "false");
      button.setAttribute("aria-label", (reveal ? "Hide" : "Show") + " password");
      input.focus({ preventScroll: true });
    });
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  async function highlightContent() {
    var codeEl = document.getElementById("content-code");
    if (!codeEl) return;

    try {
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";

      await new Promise(function(resolve, reject) {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      if (window.hljs) {
        window.hljs.highlightElement(codeEl);
      }
    } catch (err) {
      console.warn("Syntax highlighting unavailable:", err);
    }
  }

  // === Markdown Detection & Rendering ===

  var rawContent = null;
  var markdownLibsLoaded = false;
  var mermaidLoaded = false;

  function detectMarkdown(text) {
    // A heading or fenced block is already an unambiguous Markdown signal.
    if (/^#{1,6}\s+\S/m.test(text) || /^```[\s\S]*?^```/m.test(text)) return true;

    var patterns = [
      /^(?:\s*)[-*+]\s+\S/m,               // Unordered lists
      /^(?:\s*)\d+\.\s+\S/m,               // Ordered lists
      /\[.+?\]\(.+?\)/,                     // Links
      /!\[.*?\]\(.+?\)/,                    // Images
      /(?:\*\*|__).+?(?:\*\*|__)/,          // Bold
      /(?:^|\s)(?:\*|_)(?!\s).+?(?:\*|_)/,  // Italic
      /^>\s+\S/m,                            // Blockquotes
      /^---{1,}$/m,                          // Horizontal rules
      /^\|.+\|/m                             // Tables
    ];

    var matches = 0;
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(text)) {
        matches++;
      }
    }
    return matches >= 2;
  }

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadMarkdownLibs() {
    if (markdownLibsLoaded) return true;
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js");
      markdownLibsLoaded = true;
      return true;
    } catch (err) {
      console.warn("Failed to load markdown libraries:", err);
      return false;
    }
  }

  async function loadMermaid() {
    if (mermaidLoaded) return true;
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js");
      var darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      window.mermaid.initialize({
        startOnLoad: false,
        theme: darkMode ? "dark" : "base",
        themeVariables: darkMode ? {
          darkMode: true,
          background: "#252525",
          primaryColor: "#2c2c2c",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#ffffff40",
          secondaryColor: "#252525",
          tertiaryColor: "#212121",
          lineColor: "#ffffff8c",
          textColor: "#ffffff",
          mainBkg: "#2c2c2c",
          nodeBorder: "#ffffff40",
          clusterBkg: "#252525",
          titleColor: "#ffffff",
          edgeLabelBackground: "#252525"
        } : {
          darkMode: false,
          background: "#ffffff",
          primaryColor: "#f5f5f5",
          primaryTextColor: "#0a0a0a",
          primaryBorderColor: "#00000040",
          secondaryColor: "#ffffff",
          tertiaryColor: "#f5f5f5",
          lineColor: "#6b6b6b",
          textColor: "#0a0a0a",
          mainBkg: "#ffffff",
          nodeBorder: "#00000040",
          clusterBkg: "#f5f5f5",
          titleColor: "#0a0a0a",
          edgeLabelBackground: "#ffffff"
        },
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        fontSize: 14
      });
      mermaidLoaded = true;
      return true;
    } catch (err) {
      console.warn("Failed to load Mermaid:", err);
      return false;
    }
  }

  async function renderMarkdown(text) {
    var loaded = await loadMarkdownLibs();
    if (!loaded || !window.marked || !window.DOMPurify) return null;

    // Configure marked with custom code renderer for mermaid + highlight.js
    window.marked.use({
      breaks: true,
      gfm: true,
      renderer: {
        code: function(code, lang, escaped) {
          lang = (lang || "").trim();

          // Mermaid diagram blocks
          if (lang === "mermaid") {
            return '<div class="mermaid-block"><pre class="mermaid">' + escapeHtml(code) + "</pre></div>";
          }

          // Regular code blocks with syntax highlighting
          var highlighted = null;
          if (window.hljs) {
            if (lang && window.hljs.getLanguage(lang)) {
              try { highlighted = window.hljs.highlight(code, { language: lang }).value; } catch (_) {}
            }
            if (!highlighted) {
              try { highlighted = window.hljs.highlightAuto(code).value; } catch (_) {}
            }
          }

          if (highlighted) {
            return '<pre><code class="hljs' + (lang ? " language-" + escapeHtml(lang) : "") + '">' + highlighted + "</code></pre>\n";
          }
          return "<pre><code>" + escapeHtml(code) + "</code></pre>\n";
        }
      }
    });

    var html = window.marked.parse(text);
    return window.DOMPurify.sanitize(html, {
      ADD_TAGS: ["input"],
      ADD_ATTR: ["type", "checked", "disabled"]
    });
  }

  function showPlainText() {
    var plainBtn = document.getElementById("plain-text-btn");
    var markdownBtn = document.getElementById("markdown-toggle-btn");
    var codeContainer = document.getElementById("content-code").parentElement;
    var renderedContainer = document.getElementById("markdown-rendered");
    if (!plainBtn || !markdownBtn || !codeContainer || !renderedContainer) return;

    codeContainer.style.display = "";
    renderedContainer.style.display = "none";
    plainBtn.classList.add("active");
    plainBtn.setAttribute("aria-pressed", "true");
    markdownBtn.classList.remove("active");
    markdownBtn.setAttribute("aria-pressed", "false");
  }

  async function showMarkdown() {
    var plainBtn = document.getElementById("plain-text-btn");
    var markdownBtn = document.getElementById("markdown-toggle-btn");
    var codeContainer = document.getElementById("content-code").parentElement;
    var renderedContainer = document.getElementById("markdown-rendered");
    if (!plainBtn || !markdownBtn || !codeContainer || !renderedContainer) return;

    if (!renderedContainer.hasChildNodes()) {
      markdownBtn.disabled = true;
      markdownBtn.textContent = "Loading…";

      var html = await renderMarkdown(rawContent);
      if (html === null) {
        markdownBtn.disabled = false;
        markdownBtn.textContent = "Markdown";
        return;
      }

      renderedContainer.innerHTML = html;
      var mermaidBlocks = renderedContainer.querySelectorAll("pre.mermaid");
      if (mermaidBlocks.length > 0) {
        var mermaidReady = await loadMermaid();
        if (mermaidReady && window.mermaid) {
          try {
            await window.mermaid.run({ nodes: mermaidBlocks });
          } catch (err) {
            console.warn("Mermaid rendering failed:", err);
          }
        }
      }
    }

    codeContainer.style.display = "none";
    renderedContainer.style.display = "block";
    plainBtn.classList.remove("active");
    plainBtn.setAttribute("aria-pressed", "false");
    markdownBtn.classList.add("active");
    markdownBtn.setAttribute("aria-pressed", "true");
    markdownBtn.disabled = false;
    markdownBtn.textContent = "Markdown";
  }

  // === Create Form Handler ===

  async function handleCreate(event) {
    event.preventDefault();

    var contentEl = document.getElementById("content");
    var expiresInEl = document.getElementById("expires-in");
    var burnAfterReadEl = document.getElementById("burn-after-read");
    var passwordEl = document.getElementById("password");
    var createBtnEl = document.getElementById("create-btn");
    var resultEl = document.getElementById("result");
    var shareUrlEl = document.getElementById("share-url");
    var errorEl = document.getElementById("error");

    if (errorEl) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    }

    var content = contentEl.value.trim();
    if (!content) {
      showError("Enter some content before creating a link.");
      return;
    }

    createBtnEl.disabled = true;
    createBtnEl.textContent = "Encrypting…";

    try {
      var key = await generateKey();
      var result = await encrypt(content, key);
      var rawKey = await exportKey(key);
      var keyBase64url = base64urlEncode(rawKey);

      var requestBody = {
        encryptedData: base64Encode(result.ciphertext),
        iv: base64Encode(result.iv),
        expiresIn: expiresInEl.value,
        burnAfterRead: burnAfterReadEl.checked
      };

      var password = passwordEl.value;
      if (password) {
        var salt = generateSalt();
        var hashBits = await derivePasswordHash(password, salt);
        requestBody.passwordHash = base64Encode(hashBits);
        requestBody.passwordSalt = base64Encode(salt);
      }

      createBtnEl.textContent = "Creating link…";
      var response = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error("Failed to create paste");

      var data = await response.json();
      shareUrlEl.value = window.location.origin + "/" + data.id + "#key=" + keyBase64url;
      document.getElementById("result-expires").textContent = formatDate(data.expiresAt);
      document.getElementById("result-password").textContent = password ? "Required" : "Not required";
      document.getElementById("result-burn").textContent = burnAfterReadEl.checked ? "After retrieval" : "At expiration";
      document.getElementById("create-form").style.display = "none";
      resultEl.style.display = "block";
      resultEl.focus();
    } catch (err) {
      console.error("Create error:", err);
      showError(err.message || "Failed to create paste. Please try again.");
    } finally {
      createBtnEl.disabled = false;
      createBtnEl.textContent = "Encrypt and create link";
    }
  }

  // === View Page Handler ===

  var storedSalt = null;

  async function handleView() {
    var pasteIdEl = document.getElementById("paste-id");
    if (!pasteIdEl) return;

    var pasteId = pasteIdEl.value;
    var fragment = window.location.hash;
    if (!fragment || !fragment.startsWith("#key=")) {
      document.getElementById("loading").style.display = "none";
      var keyMissingEl = document.getElementById("key-missing");
      keyMissingEl.style.display = "grid";
      keyMissingEl.focus();
      return;
    }

    var keyBase64url = fragment.slice(5);
    var rawKey;
    try {
      rawKey = base64urlDecode(keyBase64url);
    } catch (err) {
      showError("Invalid decryption key", "The key in the URL appears to be malformed.");
      return;
    }

    try {
      var response = await fetch("/api/paste/" + pasteId);
      if (response.status === 401) {
        var data = await response.json();
        storedSalt = data.salt;
        document.getElementById("loading").style.display = "none";
        document.getElementById("password-prompt").style.display = "block";
        document.getElementById("password-input").focus();
        return;
      }
      if (response.status === 404) {
        showError("Paste not found", "This paste may have expired or been deleted.");
        return;
      }
      if (!response.ok) {
        showError("Unable to retrieve paste", "Please try again in a moment.");
        return;
      }

      document.getElementById("loading-text").textContent = "Decrypting locally…";
      await decryptAndDisplay(await response.json(), rawKey);
    } catch (err) {
      console.error("View error:", err);
      showError("Connection error", "Check your network connection and try again.");
    }
  }

  async function handleUnlock(event) {
    if (event) event.preventDefault();

    var passwordInputEl = document.getElementById("password-input");
    var passwordErrorEl = document.getElementById("password-error");
    var unlockBtnEl = document.getElementById("unlock-btn");
    var pasteIdEl = document.getElementById("paste-id");
    var password = passwordInputEl.value;

    passwordInputEl.removeAttribute("aria-invalid");
    passwordErrorEl.style.display = "none";
    passwordErrorEl.textContent = "";

    if (!password) {
      passwordInputEl.setAttribute("aria-invalid", "true");
      passwordErrorEl.textContent = "Enter the password to continue.";
      passwordErrorEl.style.display = "block";
      passwordInputEl.focus();
      return;
    }

    if (!storedSalt) {
      showError("Missing password data", "Refresh the page and try again.");
      return;
    }

    unlockBtnEl.disabled = true;
    unlockBtnEl.textContent = "Unlocking…";

    try {
      var salt = base64Decode(storedSalt);
      var hashBits = await derivePasswordHash(password, salt);
      var response = await fetch("/api/paste/" + pasteIdEl.value, {
        headers: { "X-Password-Hash": base64Encode(hashBits) }
      });

      if (response.status === 403) {
        passwordInputEl.value = "";
        passwordInputEl.setAttribute("aria-invalid", "true");
        passwordErrorEl.textContent = "That password is incorrect. Try again.";
        passwordErrorEl.style.display = "block";
        passwordInputEl.focus();
        return;
      }
      if (response.status === 404) {
        showError("Paste not found", "This paste may have expired or been deleted.");
        return;
      }
      if (!response.ok) {
        showError("Unable to retrieve paste", "Please try again in a moment.");
        return;
      }

      var rawKey = base64urlDecode(window.location.hash.slice(5));
      await decryptAndDisplay(await response.json(), rawKey);
    } catch (err) {
      console.error("Unlock error:", err);
      showError("Unlock failed", "The paste could not be decrypted.");
    } finally {
      unlockBtnEl.disabled = false;
      unlockBtnEl.textContent = "Unlock paste";
    }
  }

  async function decryptAndDisplay(responseData, rawKey) {
    try {
      var ciphertext = base64Decode(responseData.data);
      var iv = base64Decode(responseData.iv);
      var key = await importKey(rawKey);
      var content = await decrypt(ciphertext, iv, key);

      document.getElementById("loading").style.display = "none";
      document.getElementById("password-prompt").style.display = "none";
      rawContent = content;

      document.getElementById("content-code").textContent = content;
      document.getElementById("content-display").style.display = "block";
      if (detectMarkdown(content)) {
        document.getElementById("view-mode-controls").style.display = "inline-flex";
      }
      document.getElementById("content-title").focus();
      await highlightContent();
    } catch (err) {
      console.error("Decrypt error:", err);
      showError("Decryption failed", "The key may be invalid or the data may be corrupted.");
    }
  }

  // === Initialize ===

  function init() {
    var createForm = document.getElementById("create-form");
    if (createForm) {
      createForm.addEventListener("submit", handleCreate);
      bindPasswordToggle("toggle-create-password", "password");

      var copyBtn = document.getElementById("copy-btn");
      copyBtn.addEventListener("click", async function() {
        var shareUrlEl = document.getElementById("share-url");
        var statusEl = document.getElementById("create-copy-status");
        var success = await copyToClipboard(shareUrlEl.value);

        if (success) {
          copyBtn.textContent = "Copied";
          statusEl.textContent = "Link copied to the clipboard.";
        } else {
          shareUrlEl.focus();
          shareUrlEl.select();
          statusEl.textContent = "Clipboard access failed. The link is selected for manual copying.";
        }

        setTimeout(function() {
          copyBtn.textContent = "Copy link";
          statusEl.textContent = "";
        }, 2500);
      });
    }

    var viewPage = document.getElementById("view-page");
    if (viewPage) {
      handleView();
      bindPasswordToggle("toggle-view-password", "password-input");
      document.getElementById("password-form").addEventListener("submit", handleUnlock);
      document.getElementById("plain-text-btn").addEventListener("click", showPlainText);
      document.getElementById("markdown-toggle-btn").addEventListener("click", showMarkdown);

      var copyContentBtn = document.getElementById("copy-content-btn");
      copyContentBtn.addEventListener("click", async function() {
        var statusEl = document.getElementById("content-copy-status");
        var textToCopy = rawContent || document.getElementById("content-code").textContent;
        var success = await copyToClipboard(textToCopy);
        copyContentBtn.textContent = success ? "Copied" : "Copy failed";
        statusEl.textContent = success
          ? "Content copied to the clipboard."
          : "Clipboard access failed. Select the content and copy it manually.";

        setTimeout(function() {
          copyContentBtn.textContent = "Copy";
          statusEl.textContent = "";
        }, 2500);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
