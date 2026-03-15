/* GenzTool.dev - Shared Utility Module */
window.GenzUtils = (function () {

  /* ── Toast Container Setup ──────────────────────────────── */
  function ensureContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  /* ── Public API ─────────────────────────────────────────── */
  return {

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'info'|'success'|'error'|'warning'} type
     * @param {number} duration  ms before auto-dismiss
     */
    showToast(message, type = 'info', duration = 3000) {
      const container = ensureContainer();
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
        <span>${message}</span>
      `;
      toast.addEventListener('click', () => this._dismissToast(toast));
      container.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => this._dismissToast(toast), duration);
      }
      return toast;
    },

    _dismissToast(toast) {
      if (!toast.parentNode) return;
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    },

    /**
     * Trigger a browser file download from a data URL.
     * @param {string} dataUrl
     * @param {string} filename
     */
    downloadFile(dataUrl, filename) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    /**
     * Trigger a browser file download from a Blob.
     * @param {Blob}   blob
     * @param {string} filename
     */
    triggerDownload(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },

    /**
     * Generate a random integer seed (0 – 999999).
     * @returns {number}
     */
    randomSeed() {
      return Math.floor(Math.random() * 1000000);
    },

    /**
     * URL-encode a prompt string.
     * @param {string} prompt
     * @returns {string}
     */
    encodePrompt(prompt) {
      return encodeURIComponent(prompt.trim());
    },

    /**
     * Human-readable byte size.
     * @param {number} bytes
     * @returns {string}
     */
    formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    },

    /**
     * Debounce a function.
     * @param {Function} func
     * @param {number}   wait  ms
     * @returns {Function}
     */
    debounce(func, wait) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), wait);
      };
    },

    /**
     * Save JSON-serialisable data to localStorage.
     * @param {string} key
     * @param {*}      data
     */
    saveToStorage(key, data) {
      try {
        localStorage.setItem(`genztool_${key}`, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('GenzUtils.saveToStorage failed:', e);
        return false;
      }
    },

    /**
     * Load data previously saved to localStorage.
     * @param {string} key
     * @returns {*|null}
     */
    loadFromStorage(key) {
      try {
        const raw = localStorage.getItem(`genztool_${key}`);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn('GenzUtils.loadFromStorage failed:', e);
        return null;
      }
    },

    /**
     * Load an image from a URL and return a Promise<HTMLImageElement>.
     * @param {string} url
     * @param {boolean} [crossOrigin=true]
     * @returns {Promise<HTMLImageElement>}
     */
    loadImageFromUrl(url, crossOrigin = true) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    },

    /**
     * Generate a short random unique ID.
     * @returns {string}
     */
    generateId() {
      return `gz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    },

    /**
     * Copy text to the clipboard.
     * @param {string} text
     * @returns {Promise<void>}
     */
    async copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0;';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        this.showToast('Copied to clipboard!', 'success', 2000);
      } catch (e) {
        this.showToast('Copy failed – please copy manually.', 'error');
      }
    },

  };
})();
