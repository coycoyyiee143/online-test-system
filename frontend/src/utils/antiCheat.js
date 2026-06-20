const AntiCheat = {
  onViolation: null,
  isDestroyed: false,
  cooldown: false,
  cooldownTime: 3000, // 3 seconds cooldown bawat violation

  _boundHandlers: {},

  init(onViolation) {
    this.onViolation = onViolation;
    this.isDestroyed = false;
    this.cooldown = false;
    this.bindEvents();
    this.requestFullscreen();
  },

  triggerViolation(type, description) {
    if (this.isDestroyed) return;
    if (this.cooldown) return; // Hindi mag-fire kung naka-cooldown pa

    this.cooldown = true;
    this.onViolation(type, description);

    setTimeout(() => {
      this.cooldown = false;
    }, this.cooldownTime);
  },

  bindEvents() {
    this._boundHandlers = {
      blur: this.handleBlur.bind(this),
      visibilitychange: this.handleVisibility.bind(this),
      contextmenu: this.handleContextMenu.bind(this),
      copy: this.handleCopy.bind(this),
      paste: this.handlePaste.bind(this),
      cut: this.handleCut.bind(this),
      keydown: this.handleKeydown.bind(this),
      beforeunload: this.handleBeforeUnload.bind(this),
    };

    window.addEventListener('blur', this._boundHandlers.blur);
    document.addEventListener('visibilitychange', this._boundHandlers.visibilitychange);
    document.addEventListener('contextmenu', this._boundHandlers.contextmenu);
    document.addEventListener('copy', this._boundHandlers.copy);
    document.addEventListener('paste', this._boundHandlers.paste);
    document.addEventListener('cut', this._boundHandlers.cut);
    document.addEventListener('keydown', this._boundHandlers.keydown);
    window.addEventListener('beforeunload', this._boundHandlers.beforeunload);
  },

  handleBlur() {
    if (this.isDestroyed) return;
    this.triggerViolation('tab_switch', 'Student switched to another window or tab');
  },

  handleVisibility() {
    if (this.isDestroyed) return;
    if (document.hidden) {
      this.triggerViolation('browser_hidden', 'Browser was minimized or tab was hidden');
    }
  },

  handleContextMenu(e) {
    e.preventDefault();
    if (this.isDestroyed) return;
    this.triggerViolation('right_click', 'Right click attempted');
  },

  handleCopy(e) {
    e.preventDefault();
    if (this.isDestroyed) return;
    this.triggerViolation('copy_attempt', 'Copy attempted');
  },

  handlePaste(e) {
    e.preventDefault();
    if (this.isDestroyed) return;
    this.triggerViolation('paste_attempt', 'Paste attempted');
  },

  handleCut(e) {
    e.preventDefault();
    if (this.isDestroyed) return;
    this.triggerViolation('cut_attempt', 'Cut attempted');
  },

  handleKeydown(e) {
    if (this.isDestroyed) return;
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.key === 's') ||
      (e.ctrlKey && e.key === 'a')
    ) {
      e.preventDefault();
      this.triggerViolation('shortcut_attempt', `Keyboard shortcut attempted: ${e.key}`);
    }
  },

  handleBeforeUnload(e) {
    if (this.isDestroyed) return;
    e.preventDefault();
    e.returnValue = '';
  },

  requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  },

  destroy() {
    this.isDestroyed = true;
    this.cooldown = false;

    window.removeEventListener('blur', this._boundHandlers.blur);
    document.removeEventListener('visibilitychange', this._boundHandlers.visibilitychange);
    document.removeEventListener('contextmenu', this._boundHandlers.contextmenu);
    document.removeEventListener('copy', this._boundHandlers.copy);
    document.removeEventListener('paste', this._boundHandlers.paste);
    document.removeEventListener('cut', this._boundHandlers.cut);
    document.removeEventListener('keydown', this._boundHandlers.keydown);
    window.removeEventListener('beforeunload', this._boundHandlers.beforeunload);

    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  },
};

export default AntiCheat;