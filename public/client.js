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
    // Hide everything else
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
    if (errorEl) {
      // Structured error with message + hint
      var msgEl = document.getElementById("error-message");
      var hintEl = document.getElementById("error-hint");
      if (msgEl && hintEl) {
        msgEl.textContent = message;
        hintEl.textContent = hint || "";
      } else {
        // Fallback for create page (simple error div)
        errorEl.textContent = message;
        errorEl.style.color = "var(--error)";
        errorEl.style.textAlign = "center";
        errorEl.style.padding = "16px";
        errorEl.style.fontSize = "13px";
      }
      errorEl.style.display = "block";
    }
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
  var markdownRendered = false;
  var markdownLibsLoaded = false;
  var mermaidLoaded = false;

  function detectMarkdown(text) {
    var patterns = [
      /^#{1,6}\s+\S/m,                     // ATX headings
      /^```[\s\S]*?^```/m,                  // Fenced code blocks
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
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "#1e1e2e",
          primaryColor: "#3b82f6",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#4a5568",
          secondaryColor: "#1e293b",
          tertiaryColor: "#1a1b2e",
          lineColor: "#64748b",
          textColor: "#e2e8f0",
          mainBkg: "#1e293b",
          nodeBorder: "#4a5568",
          clusterBkg: "#1e1e2e",
          titleColor: "#e2e8f0",
          edgeLabelBackground: "#1e293b"
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

  async function toggleMarkdown() {
    var toggleBtn = document.getElementById("markdown-toggle-btn");
    var codeContainer = document.getElementById("content-code").parentElement;
    var renderedContainer = document.getElementById("markdown-rendered");

    if (!toggleBtn || !codeContainer || !renderedContainer) return;

    if (markdownRendered) {
      // Switch to raw view
      codeContainer.style.display = "";
      renderedContainer.style.display = "none";
      toggleBtn.textContent = "Render Markdown";
      toggleBtn.classList.remove("active");
      markdownRendered = false;
    } else {
      // Switch to rendered view
      toggleBtn.disabled = true;
      toggleBtn.textContent = "Loading...";

      var html = await renderMarkdown(rawContent);
      if (html === null) {
        toggleBtn.disabled = false;
        toggleBtn.textContent = "Render Markdown";
        return;
      }

      renderedContainer.innerHTML = html;

      // Render mermaid diagrams if any are present
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

      codeContainer.style.display = "none";
      renderedContainer.style.display = "block";
      toggleBtn.textContent = "View Raw";
      toggleBtn.classList.add("active");
      toggleBtn.disabled = false;
      markdownRendered = true;
    }
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

    // Clear previous error
    if (errorEl) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    }

    var content = contentEl.value.trim();

    if (!content) {
      showError("Please enter some content");
      return;
    }

    createBtnEl.disabled = true;
    createBtnEl.textContent = "Encrypting...";

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

      var response = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("Failed to create paste");
      }

      var data = await response.json();
      var shareUrl = window.location.origin + "/" + data.id + "#key=" + keyBase64url;

      shareUrlEl.value = shareUrl;
      resultEl.style.display = "block";

      // Hide form
      document.getElementById("create-form").style.display = "none";

    } catch (err) {
      console.error("Create error:", err);
      showError(err.message || "Failed to create paste. Please try again.");
    } finally {
      createBtnEl.disabled = false;
      createBtnEl.textContent = "Create secure link";
    }
  }

  // === View Page Handler ===

  var storedSalt = null;

  async function handleView() {
    var pasteIdEl = document.getElementById("paste-id");
    if (!pasteIdEl) return;

    var pasteId = pasteIdEl.value;

    // Extract key from URL fragment
    var fragment = window.location.hash;
    if (!fragment || !fragment.startsWith("#key=")) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("key-missing").style.display = "block";
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
        var pwInput = document.getElementById("password-input");
        if (pwInput) pwInput.focus();
        return;
      }

      if (response.status === 403) {
        showError("Incorrect password", "Please check the password and try again.");
        return;
      }

      if (response.status === 404) {
        showError("Paste not found", "This paste may have expired or been deleted.");
        return;
      }

      if (!response.ok) {
        showError("Something went wrong", "Failed to retrieve the paste.");
        return;
      }

      await decryptAndDisplay(await response.json(), rawKey);

    } catch (err) {
      console.error("View error:", err);
      showError("Connection error", "Please check your network and try again.");
    }
  }

  async function handleUnlock() {
    var passwordInputEl = document.getElementById("password-input");
    var unlockBtnEl = document.getElementById("unlock-btn");
    var pasteIdEl = document.getElementById("paste-id");

    var password = passwordInputEl.value;
    var pasteId = pasteIdEl.value;

    if (!password) return;

    if (!storedSalt) {
      showError("Missing data", "Password salt not available. Please refresh and try again.");
      return;
    }

    unlockBtnEl.disabled = true;
    unlockBtnEl.textContent = "Unlocking...";

    try {
      var salt = base64Decode(storedSalt);
      var hashBits = await derivePasswordHash(password, salt);
      var passwordHash = base64Encode(hashBits);

      var response = await fetch("/api/paste/" + pasteId, {
        headers: { "X-Password-Hash": passwordHash }
      });

      if (response.status === 403) {
        unlockBtnEl.disabled = false;
        unlockBtnEl.textContent = "Unlock";
        // Show inline error - shake the card or show message
        passwordInputEl.value = "";
        passwordInputEl.placeholder = "Incorrect password — try again";
        passwordInputEl.focus();
        return;
      }

      if (response.status === 404) {
        showError("Paste not found", "This paste may have expired or been deleted.");
        return;
      }

      if (!response.ok) {
        showError("Something went wrong", "Failed to retrieve the paste.");
        return;
      }

      var fragment = window.location.hash;
      var keyBase64url = fragment.slice(5);
      var rawKey = base64urlDecode(keyBase64url);

      await decryptAndDisplay(await response.json(), rawKey);

    } catch (err) {
      console.error("Unlock error:", err);
      showError("Unlock failed", "Something went wrong during decryption.");
    } finally {
      unlockBtnEl.disabled = false;
      unlockBtnEl.textContent = "Unlock";
    }
  }

  async function decryptAndDisplay(responseData, rawKey) {
    try {
      var ciphertext = base64Decode(responseData.data);
      var iv = base64Decode(responseData.iv);

      var key = await importKey(rawKey);
      var content = await decrypt(ciphertext, iv, key);

      // Hide loading/password prompt
      document.getElementById("loading").style.display = "none";
      document.getElementById("password-prompt").style.display = "none";

      // Store raw content for markdown toggle
      rawContent = content;

      // Display content
      var contentCodeEl = document.getElementById("content-code");
      contentCodeEl.textContent = content;
      document.getElementById("content-display").style.display = "block";

      // Show burn notice if applicable
      // (We check the response - if the API returned data, the burn happened server-side)

      // Check for markdown and show toggle if detected
      if (detectMarkdown(content)) {
        var toggleBtn = document.getElementById("markdown-toggle-btn");
        if (toggleBtn) toggleBtn.style.display = "";
      }

      // Apply syntax highlighting
      await highlightContent();

    } catch (err) {
      console.error("Decrypt error:", err);
      showError("Decryption failed", "The key may be invalid or the data may be corrupted.");
    }
  }

  // === Initialize ===

  function init() {
    // Create page
    var createForm = document.getElementById("create-form");
    if (createForm) {
      createForm.addEventListener("submit", handleCreate);

      var copyBtn = document.getElementById("copy-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", async function() {
          var shareUrl = document.getElementById("share-url").value;
          var success = await copyToClipboard(shareUrl);
          if (success) {
            copyBtn.textContent = "Copied!";
            copyBtn.style.color = "var(--success)";
            copyBtn.style.borderColor = "var(--success-border)";
            setTimeout(function() {
              copyBtn.textContent = "Copy link";
              copyBtn.style.color = "";
              copyBtn.style.borderColor = "";
            }, 2000);
          }
        });
      }
    }

    // View page
    var viewPage = document.getElementById("view-page");
    if (viewPage) {
      handleView();

      var unlockBtn = document.getElementById("unlock-btn");
      if (unlockBtn) {
        unlockBtn.addEventListener("click", handleUnlock);
      }

      var passwordInput = document.getElementById("password-input");
      if (passwordInput) {
        passwordInput.addEventListener("keypress", function(e) {
          if (e.key === "Enter") {
            handleUnlock();
          }
        });
      }

      // Markdown toggle button
      var markdownToggleBtn = document.getElementById("markdown-toggle-btn");
      if (markdownToggleBtn) {
        markdownToggleBtn.addEventListener("click", toggleMarkdown);
      }

      // Copy content button (always copies raw text)
      var copyContentBtn = document.getElementById("copy-content-btn");
      if (copyContentBtn) {
        copyContentBtn.addEventListener("click", async function() {
          var textToCopy = rawContent || document.getElementById("content-code").textContent;
          var success = await copyToClipboard(textToCopy);
          if (success) {
            copyContentBtn.textContent = "Copied!";
            copyContentBtn.style.color = "var(--success)";
            copyContentBtn.style.borderColor = "var(--success-border)";
            setTimeout(function() {
              copyContentBtn.textContent = "Copy";
              copyContentBtn.style.color = "";
              copyContentBtn.style.borderColor = "";
            }, 2000);
          }
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
