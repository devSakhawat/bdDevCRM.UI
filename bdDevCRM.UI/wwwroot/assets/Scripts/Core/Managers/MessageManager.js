





/*=========================================================
 * Message Manager (Standalone)
 * File: MessageManager.js
 * Path: wwwroot/assets/Scripts/Common/MessageManager.js
 * Description: Independent notification, confirmation, alert, and loading system
 * Dependencies: NONE (Pure Vanilla JavaScript)
 * Author: devSakhawat
 * Date: 2025-01-13
=========================================================*/

var MessageManager = (function () {
  'use strict';

  // ============================================
  // PRIVATE - Configuration
  // ============================================

  var _config = {
    // Toast Notifications
    toast: {
      duration: 3000,
      position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
      maxVisible: 5,
      closeButton: true,
      progressBar: true,
      pauseOnHover: true,
      newestOnTop: true
    },
    // Modal Alerts
    modal: {
      animation: 'fadeIn',
      closeOnEscape: true,
      closeOnBackdrop: true,
      showCloseButton: true
    },
    // Loading Overlay
    loading: {
      spinner: 'dots', // dots, circle, bars
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      textColor: '#ffffff',
      spinnerColor: '#4CAF50'
    }
  };

  // ============================================
  // PRIVATE - State Management
  // ============================================

  var _state = {
    toastContainer: null,
    toastQueue: [],
    activeToasts: [],
    loadingOverlay: null,
    loadingCount: 0,
    modalStack: [],
    initialized: false
  };

  // ============================================
  // PRIVATE - Initialization
  // ============================================

  /**
   * Initialize MessageManager
   */
  function _initialize() {
    if (_state.initialized) return;

    // Inject CSS
    _injectStyles();

    // Create toast container
    _createToastContainer();

    // Initialize keyboard listeners
    _initKeyboardListeners();

    _state.initialized = true;
  }

  /**
   * Inject CSS styles
   */
  function _injectStyles() {
    if (document.getElementById('messagemanager-styles')) return;

    const css = `
      /* ========== Toast Notifications ========== */
      .mm-toast-container {
        position: fixed;
        z-index: 999999;
        pointer-events: none;
      }
      
      .mm-toast-container.top-right {
        top: 20px;
        right: 20px;
      }
      
      .mm-toast-container.top-left {
        top: 20px;
        left: 20px;
      }
      
      .mm-toast-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .mm-toast-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .mm-toast-container.top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .mm-toast-container.bottom-center {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .mm-toast {
        min-width: 300px;
        max-width: 500px;
        margin-bottom: 10px;
        padding: 16px 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        pointer-events: auto;
        animation: mm-slideIn 0.3s ease-out;
        position: relative;
        overflow: hidden;
      }

      .mm-toast.removing {
        animation: mm-slideOut 0.3s ease-out forwards;
      }

      .mm-toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 14px;
        font-weight: bold;
      }

      .mm-toast-content {
        flex: 1;
        min-width: 0;
      }

      .mm-toast-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
        color: #333;
      }

      .mm-toast-message {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .mm-toast-close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 18px;
        line-height: 1;
        transition: color 0.2s;
      }

      .mm-toast-close:hover {
        color: #333;
      }

      .mm-toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        opacity: 0.5;
        transition: width linear;
      }

      /* Toast Types */
      .mm-toast.success {
        border-left: 4px solid #4CAF50;
      }
      
      .mm-toast.success .mm-toast-icon {
        background: #4CAF50;
        color: white;
      }

      .mm-toast.error {
        border-left: 4px solid #f44336;
      }
      
      .mm-toast.error .mm-toast-icon {
        background: #f44336;
        color: white;
      }

      .mm-toast.warning {
        border-left: 4px solid #ff9800;
      }
      
      .mm-toast.warning .mm-toast-icon {
        background: #ff9800;
        color: white;
      }

      .mm-toast.info {
        border-left: 4px solid #2196F3;
      }
      
      .mm-toast.info .mm-toast-icon {
        background: #2196F3;
        color: white;
      }

      /* ========== Modal Overlay ========== */
      .mm-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: mm-fadeIn 0.2s ease-out;
        padding: 20px;
        overflow-y: auto;
      }

      .mm-modal-overlay.removing {
        animation: mm-fadeOut 0.2s ease-out forwards;
      }

      .mm-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 500px;
        width: 100%;
        animation: mm-scaleIn 0.3s ease-out;
        position: relative;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }

      .mm-modal.removing {
        animation: mm-scaleOut 0.2s ease-out forwards;
      }

      .mm-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .mm-modal-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mm-modal-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .mm-modal-icon.success { background: #4CAF50; color: white; }
      .mm-modal-icon.error { background: #f44336; color: white; }
      .mm-modal-icon.warning { background: #ff9800; color: white; }
      .mm-modal-icon.info { background: #2196F3; color: white; }
      .mm-modal-icon.question { background: #9C27B0; color: white; }

      .mm-modal-close {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 24px;
        line-height: 1;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .mm-modal-close:hover {
        background: #f5f5f5;
        color: #333;
      }

      .mm-modal-body {
        padding: 24px;
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        overflow-y: auto;
        flex: 1;
      }

      .mm-modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-shrink: 0;
      }

      .mm-modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 80px;
      }

      .mm-modal-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .mm-modal-btn:active {
        transform: translateY(0);
      }

      .mm-modal-btn-primary {
        background: #2196F3;
        color: white;
      }

      .mm-modal-btn-primary:hover {
        background: #1976D2;
      }

      .mm-modal-btn-success {
        background: #4CAF50;
        color: white;
      }

      .mm-modal-btn-success:hover {
        background: #388E3C;
      }

      .mm-modal-btn-danger {
        background: #f44336;
        color: white;
      }

      .mm-modal-btn-danger:hover {
        background: #D32F2F;
      }

      .mm-modal-btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .mm-modal-btn-secondary:hover {
        background: #bdbdbd;
      }

      /* ========== Loading Overlay ========== */
      .mm-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: mm-fadeIn 0.2s ease-out;
      }

      .mm-loading-spinner {
        margin-bottom: 20px;
      }

      .mm-loading-text {
        color: white;
        font-size: 16px;
        font-weight: 500;
      }

      /* Spinner - Dots */
      .mm-spinner-dots {
        display: flex;
        gap: 8px;
      }

      .mm-spinner-dots span {
        width: 12px;
        height: 12px;
        background: #4CAF50;
        border-radius: 50%;
        animation: mm-bounce 1.4s infinite ease-in-out both;
      }

      .mm-spinner-dots span:nth-child(1) { animation-delay: -0.32s; }
      .mm-spinner-dots span:nth-child(2) { animation-delay: -0.16s; }

      /* Spinner - Circle */
      .mm-spinner-circle {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #4CAF50;
        border-radius: 50%;
        animation: mm-spin 1s linear infinite;
      }

      /* Spinner - Bars */
      .mm-spinner-bars {
        display: flex;
        gap: 6px;
        align-items: center;
        height: 40px;
      }

      .mm-spinner-bars span {
        width: 4px;
        height: 100%;
        background: #4CAF50;
        animation: mm-bar-scale 1.2s infinite ease-in-out;
      }

      .mm-spinner-bars span:nth-child(1) { animation-delay: -0.4s; }
      .mm-spinner-bars span:nth-child(2) { animation-delay: -0.3s; }
      .mm-spinner-bars span:nth-child(3) { animation-delay: -0.2s; }
      .mm-spinner-bars span:nth-child(4) { animation-delay: -0.1s; }
      .mm-spinner-bars span:nth-child(5) { animation-delay: 0s; }

      /* ========== Animations ========== */
      @keyframes mm-slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes mm-slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes mm-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes mm-fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes mm-scaleIn {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes mm-scaleOut {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.8);
          opacity: 0;
        }
      }

      @keyframes mm-bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      @keyframes mm-spin {
        to { transform: rotate(360deg); }
      }

      @keyframes mm-bar-scale {
        0%, 40%, 100% {
          transform: scaleY(0.4);
        }
        20% {
          transform: scaleY(1);
        }
      }

      /* ========== Responsive ========== */
      @media (max-width: 768px) {
        .mm-toast {
          min-width: 280px;
          max-width: calc(100vw - 40px);
        }

        .mm-modal {
          max-width: calc(100vw - 40px);
          margin: auto;
        }

        .mm-modal-footer {
          flex-direction: column-reverse;
        }

        .mm-modal-btn {
          width: 100%;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = 'messagemanager-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Create toast container
   */
  function _createToastContainer() {
    if (_state.toastContainer) return;

    const container = document.createElement('div');
    container.className = 'mm-toast-container ' + _config.toast.position;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(container);

    _state.toastContainer = container;
  }

  /**
   * Initialize keyboard listeners
   */
  function _initKeyboardListeners() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _config.modal.closeOnEscape) {
        const topModal = _state.modalStack[_state.modalStack.length - 1];
        if (topModal) {
          _closeModal(topModal);
        }
      }
    });
  }

  // ============================================
  // PRIVATE - Toast Functions
  // ============================================

  /**
   * Show toast notification
   */
  function _showToast(type, message, title, options) {
    _initialize();

    options = Object.assign({}, _config.toast, options || {});

    const toast = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: type,
      message: message,
      title: title,
      options: options,
      element: null
    };

    // Create toast element
    toast.element = _createToastElement(toast);

    // Add to container
    if (options.newestOnTop) {
      _state.toastContainer.insertBefore(toast.element, _state.toastContainer.firstChild);
    } else {
      _state.toastContainer.appendChild(toast.element);
    }

    // Add to active toasts
    _state.activeToasts.push(toast);

    // Auto-hide
    if (options.duration > 0) {
      const startTime = Date.now();
      let timeoutId;
      let remainingTime = options.duration;

      const startProgress = function () {
        const progressBar = toast.element.querySelector('.mm-toast-progress');
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.transitionDuration = remainingTime + 'ms';
          setTimeout(() => {
            progressBar.style.width = '0%';
          }, 10);
        }

        timeoutId = setTimeout(() => {
          _removeToast(toast);
        }, remainingTime);
      };

      const pauseProgress = function () {
        if (timeoutId) {
          clearTimeout(timeoutId);
          const elapsed = Date.now() - startTime;
          remainingTime = options.duration - elapsed;

          const progressBar = toast.element.querySelector('.mm-toast-progress');
          if (progressBar) {
            const currentWidth = parseFloat(window.getComputedStyle(progressBar).width);
            const containerWidth = toast.element.offsetWidth;
            const percentage = (currentWidth / containerWidth) * 100;
            progressBar.style.transitionDuration = '0s';
            progressBar.style.width = percentage + '%';
          }
        }
      };

      startProgress();

      if (options.pauseOnHover) {
        toast.element.addEventListener('mouseenter', pauseProgress);
        toast.element.addEventListener('mouseleave', startProgress);
      }
    }

    // Limit visible toasts
    if (_state.activeToasts.length > options.maxVisible) {
      const toRemove = _state.activeToasts[0];
      _removeToast(toRemove);
    }

    return toast;
  }

  /**
   * Create toast element
   */
  function _createToastElement(toast) {
    const div = document.createElement('div');
    div.className = 'mm-toast ' + toast.type;
    div.setAttribute('role', 'alert');
    div.setAttribute('aria-live', 'polite');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    let html = '<div class="mm-toast-icon">' + icons[toast.type] + '</div>';
    html += '<div class="mm-toast-content">';
    if (toast.title) {
      html += '<div class="mm-toast-title">' + _escapeHtml(toast.title) + '</div>';
    }
    html += '<div class="mm-toast-message">' + toast.message + '</div>';
    html += '</div>';

    if (toast.options.closeButton) {
      html += '<button class="mm-toast-close" aria-label="Close">×</button>';
    }

    if (toast.options.progressBar) {
      html += '<div class="mm-toast-progress"></div>';
    }

    div.innerHTML = html;

    // Close button handler
    const closeBtn = div.querySelector('.mm-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        _removeToast(toast);
      });
    }

    return div;
  }

  /**
   * Remove toast
   */
  function _removeToast(toast) {
    if (!toast || !toast.element) return;

    toast.element.classList.add('removing');

    setTimeout(() => {
      if (toast.element && toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }

      const index = _state.activeToasts.indexOf(toast);
      if (index > -1) {
        _state.activeToasts.splice(index, 1);
      }
    }, 300);
  }

  // ============================================
  // PRIVATE - Modal Functions
  // ============================================

  /**
   * Show modal
   */
  function _showModal(type, title, message, buttons, options) {
    _initialize();

    options = Object.assign({}, _config.modal, options || {});

    return new Promise((resolve, reject) => {
      const modal = {
        id: 'modal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: type,
        title: title,
        message: message,
        buttons: buttons,
        options: options,
        overlay: null,
        element: null,
        resolve: resolve,
        reject: reject
      };

      // Create modal
      modal.overlay = _createModalElement(modal);
      document.body.appendChild(modal.overlay);

      // Add to stack
      _state.modalStack.push(modal);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    });
  }

  /**
   * Create modal element
   */
  function _createModalElement(modal) {
    const overlay = document.createElement('div');
    overlay.className = 'mm-modal-overlay';

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      question: '?'
    };

    let html = '<div class="mm-modal">';
    html += '<div class="mm-modal-header">';
    html += '<h3 class="mm-modal-title">';
    html += '<span class="mm-modal-icon ' + modal.type + '">' + icons[modal.type] + '</span>';
    html += _escapeHtml(modal.title);
    html += '</h3>';

    if (modal.options.showCloseButton) {
      html += '<button class="mm-modal-close" aria-label="Close">×</button>';
    }

    html += '</div>';
    html += '<div class="mm-modal-body">' + modal.message + '</div>';

    if (modal.buttons && modal.buttons.length) {
      html += '<div class="mm-modal-footer">';
      modal.buttons.forEach((btn, index) => {
        const btnClass = btn.className || 'mm-modal-btn-secondary';
        html += '<button class="mm-modal-btn ' + btnClass + '" data-action="' + index + '">';
        html += _escapeHtml(btn.text || 'Button');
        html += '</button>';
      });
      html += '</div>';
    }

    html += '</div>';

    overlay.innerHTML = html;
    modal.element = overlay.querySelector('.mm-modal');

    // Close button handler
    const closeBtn = overlay.querySelector('.mm-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        _closeModal(modal);
      });
    }

    // Backdrop click handler
    if (modal.options.closeOnBackdrop) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          _closeModal(modal);
        }
      });
    }

    // Button handlers
    const buttons = overlay.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-action'));
        const buttonDef = modal.buttons[index];

        if (buttonDef && buttonDef.onClick) {
          const result = buttonDef.onClick();
          if (result !== false) {
            _closeModal(modal, result);
          }
        } else {
          _closeModal(modal);
        }
      });
    });

    return overlay;
  }

  /**
   * Close modal
   */
  function _closeModal(modal, result) {
    if (!modal) return;

    modal.overlay.classList.add('removing');
    modal.element.classList.add('removing');

    setTimeout(() => {
      if (modal.overlay && modal.overlay.parentNode) {
        modal.overlay.parentNode.removeChild(modal.overlay);
      }

      const index = _state.modalStack.indexOf(modal);
      if (index > -1) {
        _state.modalStack.splice(index, 1);
      }

      // Restore body scroll if no more modals
      if (_state.modalStack.length === 0) {
        document.body.style.overflow = '';
      }

      modal.resolve(result);
    }, 200);
  }

  // ============================================
  // PRIVATE - Loading Functions
  // ============================================

  /**
   * Show loading overlay
   */
  function _showLoading(message) {
    _initialize();

    _state.loadingCount++;

    if (_state.loadingOverlay) {
      // Update message
      const textEl = _state.loadingOverlay.querySelector('.mm-loading-text');
      if (textEl && message) {
        textEl.textContent = message;
      }
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'mm-loading-overlay';

    const spinnerType = _config.loading.spinner;
    let spinnerHtml = '';

    if (spinnerType === 'dots') {
      spinnerHtml = '<div class="mm-spinner-dots"><span></span><span></span><span></span></div>';
    } else if (spinnerType === 'circle') {
      spinnerHtml = '<div class="mm-spinner-circle"></div>';
    } else if (spinnerType === 'bars') {
      spinnerHtml = '<div class="mm-spinner-bars"><span></span><span></span><span></span><span></span><span></span></div>';
    }

    overlay.innerHTML = '<div class="mm-loading-spinner">' + spinnerHtml + '</div>';

    if (message) {
      overlay.innerHTML += '<div class="mm-loading-text">' + _escapeHtml(message) + '</div>';
    }

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    _state.loadingOverlay = overlay;
  }

  /**
   * Hide loading overlay
   */
  function _hideLoading() {
    _state.loadingCount--;

    if (_state.loadingCount > 0) {
      return;
    }

    if (_state.loadingOverlay) {
      const overlay = _state.loadingOverlay;
      overlay.style.opacity = '0';

      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        _state.loadingOverlay = null;
        document.body.style.overflow = '';
      }, 200);
    }
  }

  // ============================================
  // PRIVATE - Utility Functions
  // ============================================

  /**
   * Escape HTML
   */
  function _escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  // ============================================
  // PUBLIC API - Toast Notifications
  // ============================================

  var notify = {
    /**
     * Success notification
     * @param {string} message - Message text
     * @param {string} title - Optional title
     * @param {number} duration - Optional duration (ms)
     */
    success: function (message, title, duration) {
      return _showToast('success', message, title || 'Success', { duration: duration });
    },

    /**
     * Error notification
     */
    error: function (message, title, duration) {
      return _showToast('error', message, title || 'Error', { duration: duration || 0 });
    },

    /**
     * Warning notification
     */
    warning: function (message, title, duration) {
      return _showToast('warning', message, title || 'Warning', { duration: duration });
    },

    /**
     * Info notification
     */
    info: function (message, title, duration) {
      return _showToast('info', message, title || 'Info', { duration: duration });
    }
  };

  // ============================================
  // PUBLIC API - Modal Alerts
  // ============================================

  var alert = {
    /**
     * Success alert
     */
    success: function (title, message, onClose) {
      return _showModal('success', title, message, [
        {
          text: 'OK',
          className: 'mm-modal-btn-success',
          onClick: function () {
            if (onClose) onClose();
          }
        }
      ]);
    },

    /**
     * Error alert
     */
    error: function (title, message, onClose) {
      return _showModal('error', title, message, [
        {
          text: 'OK',
          className: 'mm-modal-btn-danger',
          onClick: function () {
            if (onClose) onClose();
          }
        }
      ]);
    },

    /**
     * Warning alert
     */
    warning: function (title, message, onClose) {
      return _showModal('warning', title, message, [
        {
          text: 'OK',
          className: 'mm-modal-btn-primary',
          onClick: function () {
            if (onClose) onClose();
          }
        }
      ]);
    },

    /**
     * Info alert
     */
    info: function (title, message, onClose) {
      return _showModal('info', title, message, [
        {
          text: 'OK',
          className: 'mm-modal-btn-primary',
          onClick: function () {
            if (onClose) onClose();
          }
        }
      ]);
    }
  };

  // ============================================
  // PUBLIC API - Confirmation Dialogs
  // ============================================

  var confirm = {
    /**
     * Generic confirmation
     */
    ask: function (title, message, onYes, onNo) {
      return _showModal('question', title, message, [
        {
          text: 'Cancel',
          className: 'mm-modal-btn-secondary',
          onClick: function () {
            if (onNo) onNo();
          }
        },
        {
          text: 'Confirm',
          className: 'mm-modal-btn-primary',
          onClick: function () {
            if (onYes) onYes();
          }
        }
      ]);
    },

    /**
     * Save confirmation
     */
    save: function (onYes, onNo) {
      return this.ask(
        'Save Confirmation',
        'Do you want to save changes?',
        onYes,
        onNo
      );
    },

    /**
     * Update confirmation
     */
    update: function (onYes, onNo) {
      return this.ask(
        'Update Confirmation',
        'Do you want to update this record?',
        onYes,
        onNo
      );
    },

    /**
     * Delete confirmation
     */
    delete: function (itemName, onYes, onNo) {
      return _showModal('warning', 'Delete Confirmation',
        'Are you sure you want to delete ' + (itemName ? '<strong>' + _escapeHtml(itemName) + '</strong>' : 'this item') + '?<br><br>This action cannot be undone.',
        [
          {
            text: 'Cancel',
            className: 'mm-modal-btn-secondary',
            onClick: function () {
              if (onNo) onNo();
            }
          },
          {
            text: 'Delete',
            className: 'mm-modal-btn-danger',
            onClick: function () {
              if (onYes) onYes();
            }
          }
        ]
      );
    }
  };

  // ============================================
  // PUBLIC API - Loading
  // ============================================

  var loading = {
    /**
     * Show loading
     */
    show: function (message) {
      _showLoading(message || 'Loading...');
    },

    /**
     * Hide loading
     */
    hide: function () {
      _hideLoading();
    },

    /**
     * Wrap async operation with loading
     */
    wrap: async function (promise, message) {
      this.show(message);
      try {
        const result = await promise;
        this.hide();
        return result;
      } catch (error) {
        this.hide();
        throw error;
      }
    }
  };

  // ============================================
  // PUBLIC API - Configuration
  // ============================================

  /**
   * Update configuration
   */
  function setConfig(newConfig) {
    if (newConfig && typeof newConfig === 'object') {
      if (newConfig.toast) Object.assign(_config.toast, newConfig.toast);
      if (newConfig.modal) Object.assign(_config.modal, newConfig.modal);
      if (newConfig.loading) Object.assign(_config.loading, newConfig.loading);
    }
  }

  /**
   * Get configuration
   */
  function getConfig() {
    return JSON.parse(JSON.stringify(_config));
  }

  /**
   * Get info
   */
  function getInfo() {
    return {
      name: 'MessageManager',
      version: '1.0.0',
      author: 'devSakhawat',
      date: '2025-01-13',
      dependencies: 'NONE (Standalone)',
      initialized: _state.initialized,
      activeToasts: _state.activeToasts.length,
      activeModals: _state.modalStack.length,
      loadingActive: _state.loadingCount > 0
    };
  }

  // ============================================
  // PUBLIC API EXPORT
  // ============================================

  return {
    // Notifications
    notify: notify,

    // Alerts
    alert: alert,

    // Confirmations
    confirm: confirm,

    // Loading
    loading: loading,

    // Configuration
    setConfig: setConfig,
    getConfig: getConfig,
    getInfo: getInfo,

    // Initialize manually (auto-initializes on first use)
    initialize: _initialize
  };
})();

// ============================================
// AUTO-INITIALIZATION
// ============================================
(function () {
  if (typeof console !== 'undefined' && console.log) {
    console.log(
      '%c[MessageManager] ✓ Loaded (Standalone - Zero Dependencies)',
      'color: #4CAF50; font-weight: bold; font-size: 12px;'
    );

    if (console.table) {
      console.table(MessageManager.getInfo());
    }
  }
})();


// ============================================
//Usage Example:
// ============================================

//// ========== Toast Notifications ==========
//MessageManager.notify.success('Operation completed successfully!');
//MessageManager.notify.error('Failed to save data!', 'Error', 5000);
//MessageManager.notify.warning('Please review your input');
//MessageManager.notify.info('New update available', 'Information');

//// ========== Alerts ==========
//MessageManager.alert.success('Success!', 'Record saved successfully');
//MessageManager.alert.error('Error!', 'Failed to connect to server');
//MessageManager.alert.warning('Warning!', 'Unsaved changes will be lost');
//MessageManager.alert.info('Info', 'System maintenance at 2 AM');

//// ========== Confirmations ==========
//MessageManager.confirm.save(
//  function () { console.log('Saved!'); },
//  function () { console.log('Cancelled'); }
//);

//MessageManager.confirm.delete('Course XYZ',
//  function () { console.log('Deleted!'); },
//  function () { console.log('Cancelled'); }
//);

//MessageManager.confirm.ask('Custom Title', 'Custom message?',
//  function () { console.log('Yes'); },
//  function () { console.log('No'); }
//);

//// ========== Loading ==========
//MessageManager.loading.show('Saving data...');
//setTimeout(() => {
//  MessageManager.loading.hide();
//}, 2000);

//// Wrap async operation
//async function saveData() {
//  await MessageManager.loading.wrap(
//    fetch('/api/save').then(r => r.json()),
//    'Saving course...'
//  );
//}

//// ========== Configuration ==========
//MessageManager.setConfig({
//  toast: {
//    duration: 5000,
//    position: 'bottom-right'
//  },
//  loading: {
//    spinner: 'circle',
//    spinnerColor: '#2196F3'
//  }
//});





































///*=========================================================
// * Message Manager
// * File: MessageManager.js
// * Description: Unified message system for notifications, confirmations, alerts, and loading
// * Uses: CommonManager, ToastrMessage from common.js
// * Author: devSakhawat
// * Date: 2025-01-13
//=========================================================*/

//var MessageManager = (function () {
//  'use strict';

//  // ============================================
//  // PRIVATE - Dependency Checks
//  // ============================================

//  function _hasToastr() {
//    return typeof ToastrMessage !== 'undefined' || typeof toastr !== 'undefined';
//  }

//  function _hasSweetAlert() {
//    return typeof Swal !== 'undefined';
//  }

//  function _hasCommonManager() {
//    return typeof CommonManager !== 'undefined' && typeof CommonManager.MsgBox === 'function';
//  }

//  function _hasKendo() {
//    return typeof kendo !== 'undefined';
//  }

//  // ============================================
//  // MODULE 1: NOTIFICATION (Toast Messages)
//  // ============================================

//  var Notification = {
//    /**
//     * Show success notification
//     * @param {string} message - Message text
//     * @param {string} title - Optional title
//     * @param {number} timeOut - Display duration in ms (default: 3000)
//     */
//    success: function (message, title, timeOut) {
//      _showToast(message, title, 'success', timeOut || 3000);
//    },

//    /**
//     * Show error notification
//     * @param {string} message - Message text
//     * @param {string} title - Optional title
//     * @param {number} timeOut - Display duration in ms (default: 0 = no auto-hide)
//     */
//    error: function (message, title, timeOut) {
//      _showToast(message, title, 'error', timeOut !== undefined ? timeOut : 0);
//    },

//    /**
//     * Show warning notification
//     * @param {string} message - Message text
//     * @param {string} title - Optional title
//     * @param {number} timeOut - Display duration in ms (default: 5000)
//     */
//    warning: function (message, title, timeOut) {
//      _showToast(message, title, 'warning', timeOut || 5000);
//    },

//    /**
//     * Show info notification
//     * @param {string} message - Message text
//     * @param {string} title - Optional title
//     * @param {number} timeOut - Display duration in ms (default: 3000)
//     */
//    info: function (message, title, timeOut) {
//      _showToast(message, title, 'info', timeOut || 3000);
//    }
//  };

//  // Private - Show toast notification
//  function _showToast(message, title, type, timeOut) {
//    if (typeof ToastrMessage !== 'undefined') {
//      // Use ToastrMessage if available
//      ToastrMessage.showToastrNotification({
//        preventDuplicates: true,
//        closeButton: timeOut === 0,
//        timeOut: timeOut,
//        message: message,
//        title: title || '',
//        type: type
//      });
//    } else if (typeof toastr !== 'undefined') {
//      // Fallback to toastr
//      toastr.options = {
//        closeButton: timeOut === 0,
//        progressBar: timeOut > 0,
//        timeOut: timeOut,
//        preventDuplicates: true
//      };
//      toastr[type](message, title || '');
//    } else {
//      // Final fallback to console
//      console.log('[' + type.toUpperCase() + '] ' + (title ? title + ': ' : '') + message);
//    }
//  }

//  // ============================================
//  // MODULE 2: CONFIRMATION (Modal with Yes/No)
//  // ============================================

//  var Confirmation = {
//    /**
//     * Show save confirmation
//     * @param {function} onYes - Callback when user clicks Yes
//     * @param {function} onNo - Optional callback when user clicks No
//     * @param {string} message - Custom message (optional)
//     */
//    save: function (onYes, onNo, message) {
//      _showConfirm({
//        title: 'Save Confirmation',
//        message: message || 'Do you want to save this information?',
//        type: 'info',
//        confirmText: 'Yes, Save',
//        cancelText: 'Cancel',
//        onYes: onYes,
//        onNo: onNo
//      });
//    },

//    /**
//     * Show update confirmation
//     * @param {function} onYes - Callback when user clicks Yes
//     * @param {function} onNo - Optional callback when user clicks No
//     * @param {string} message - Custom message (optional)
//     */
//    update: function (onYes, onNo, message) {
//      _showConfirm({
//        title: 'Update Confirmation',
//        message: message || 'Do you want to update this information?',
//        type: 'info',
//        confirmText: 'Yes, Update',
//        cancelText: 'Cancel',
//        onYes: onYes,
//        onNo: onNo
//      });
//    },

//    /**
//     * Show delete confirmation
//     * @param {string} itemName - Name of item to delete (e.g., 'user', 'record')
//     * @param {function} onYes - Callback when user clicks Yes
//     * @param {function} onNo - Optional callback when user clicks No
//     */
//    delete: function (itemName, onYes, onNo) {
//      _showConfirm({
//        title: 'Delete Confirmation',
//        message: 'Are you sure you want to delete this ' + (itemName || 'item') + '?',
//        type: 'warning',
//        confirmText: 'Yes, Delete',
//        cancelText: 'Cancel',
//        onYes: onYes,
//        onNo: onNo
//      });
//    },

//    /**
//     * Show discard changes confirmation
//     * @param {function} onYes - Callback when user clicks Yes
//     * @param {function} onNo - Optional callback when user clicks No
//     */
//    discard: function (onYes, onNo) {
//      _showConfirm({
//        title: 'Discard Changes',
//        message: 'You have unsaved changes. Do you want to discard them?',
//        type: 'warning',
//        confirmText: 'Yes, Discard',
//        cancelText: 'No, Keep Editing',
//        onYes: onYes,
//        onNo: onNo
//      });
//    },

//    /**
//     * Show custom confirmation
//     * @param {object} options - Configuration object
//     */
//    custom: function (options) {
//      _showConfirm(options);
//    }
//  };

//  // Private - Show confirmation dialog
//  function _showConfirm(options) {
//    var defaults = {
//      title: 'Confirmation',
//      message: 'Are you sure?',
//      type: 'info',
//      confirmText: 'Yes',
//      cancelText: 'No',
//      onYes: null,
//      onNo: null
//    };

//    var config = Object.assign({}, defaults, options);

//    // Use CommonManager.MsgBox if available
//    if (_hasCommonManager()) {
//      CommonManager.MsgBox(
//        config.type,
//        'center',
//        config.title,
//        config.message,
//        [
//          {
//            addClass: 'btn btn-primary',
//            text: config.confirmText,
//            onClick: function ($noty) {
//              $noty.close();
//              if (config.onYes) config.onYes();
//            }
//          },
//          {
//            addClass: 'btn btn-secondary',
//            text: config.cancelText,
//            onClick: function ($noty) {
//              $noty.close();
//              if (config.onNo) config.onNo();
//            }
//          }
//        ],
//        0
//      );
//    }
//    // Fallback to SweetAlert2
//    else if (_hasSweetAlert()) {
//      Swal.fire({
//        title: config.title,
//        html: config.message,
//        icon: config.type,
//        showCancelButton: true,
//        confirmButtonText: config.confirmText,
//        cancelButtonText: config.cancelText,
//        allowOutsideClick: false
//      }).then(function (result) {
//        if (result.isConfirmed && config.onYes) {
//          config.onYes();
//        } else if (result.isDismissed && config.onNo) {
//          config.onNo();
//        }
//      });
//    }
//    // Fallback to Kendo confirm
//    else if (_hasKendo() && kendo.confirm) {
//      kendo.confirm(config.message)
//        .done(function () {
//          if (config.onYes) config.onYes();
//        })
//        .fail(function () {
//          if (config.onNo) config.onNo();
//        });
//    }
//    // Final fallback to browser confirm
//    else {
//      if (window.confirm(config.message)) {
//        if (config.onYes) config.onYes();
//      } else {
//        if (config.onNo) config.onNo();
//      }
//    }
//  }

//  // ============================================
//  // MODULE 3: ALERT (Modal with OK only)
//  // ============================================

//  var Alert = {
//    /**
//     * Show success alert
//     * @param {string} title - Alert title
//     * @param {string} message - Alert message
//     * @param {function} onClose - Optional callback when closed
//     */
//    success: function (title, message, onClose) {
//      _showAlert(title, message, 'success', onClose);
//    },

//    /**
//     * Show error alert
//     * @param {string} title - Alert title
//     * @param {string} message - Alert message
//     * @param {function} onClose - Optional callback when closed
//     */
//    error: function (title, message, onClose) {
//      _showAlert(title, message, 'error', onClose);
//    },

//    /**
//     * Show warning alert
//     * @param {string} title - Alert title
//     * @param {string} message - Alert message
//     * @param {function} onClose - Optional callback when closed
//     */
//    warning: function (title, message, onClose) {
//      _showAlert(title, message, 'warning', onClose);
//    },

//    /**
//     * Show info alert
//     * @param {string} title - Alert title
//     * @param {string} message - Alert message
//     * @param {function} onClose - Optional callback when closed
//     */
//    info: function (title, message, onClose) {
//      _showAlert(title, message, 'info', onClose);
//    }
//  };

//  // Private - Show alert dialog
//  function _showAlert(title, message, type, onClose) {
//    // Use CommonManager.MsgBox if available
//    if (_hasCommonManager()) {
//      CommonManager.MsgBox(
//        type,
//        'center',
//        title,
//        message,
//        [
//          {
//            addClass: 'btn btn-primary',
//            text: 'OK',
//            onClick: function ($noty) {
//              $noty.close();
//              if (onClose) onClose();
//            }
//          }
//        ],
//        0
//      );
//    }
//    // Fallback to SweetAlert2
//    else if (_hasSweetAlert()) {
//      Swal.fire({
//        title: title,
//        html: message,
//        icon: type,
//        confirmButtonText: 'OK'
//      }).then(function () {
//        if (onClose) onClose();
//      });
//    }
//    // Fallback to Kendo alert
//    else if (_hasKendo() && kendo.alert) {
//      kendo.alert(message).done(function () {
//        if (onClose) onClose();
//      });
//    }
//    // Final fallback to browser alert
//    else {
//      window.alert(title + '\n\n' + message);
//      if (onClose) onClose();
//    }
//  }

//  // ============================================
//  // MODULE 4: LOADING (Overlay/Spinner)
//  // ============================================

//  var Loading = {
//    _counter: 0,
//    _overlay: null,

//    /**
//     * Show loading overlay
//     * @param {string} message - Loading message (default: "Processing... Please wait.")
//     */
//    show: function (message) {
//      // Use CommonManager if available
//      if (_hasCommonManager() && typeof CommonManager.showProcessingOverlay === 'function') {
//        CommonManager.showProcessingOverlay(message);
//        return;
//      }

//      // Fallback to custom implementation
//      this._counter++;
//      if (this._counter === 1) {
//        this._createOverlay(message);
//      }
//    },

//    /**
//     * Hide loading overlay
//     */
//    hide: function () {
//      // Use CommonManager if available
//      if (_hasCommonManager() && typeof CommonManager.hideProcessingOverlay === 'function') {
//        CommonManager.hideProcessingOverlay();
//        return;
//      }

//      // Fallback to custom implementation
//      this._counter--;
//      if (this._counter <= 0) {
//        this._counter = 0;
//        this._removeOverlay();
//      }
//    },

//    /**
//     * Wrap async operation with loading overlay
//     * @param {Promise} promise - Async operation
//     * @param {string} message - Loading message
//     * @returns {Promise} Original promise result
//     */
//    wrap: async function (promise, message) {
//      this.show(message);
//      try {
//        const result = await promise;
//        return result;
//      } finally {
//        this.hide();
//      }
//    },

//    /**
//     * Force hide all loading overlays
//     */
//    forceHide: function () {
//      this._counter = 0;

//      // Use CommonManager if available
//      if (_hasCommonManager() && typeof CommonManager.hideProcessingOverlay === 'function') {
//        CommonManager.hideProcessingOverlay();
//      }

//      this._removeOverlay();
//    },

//    // Private - Create loading overlay
//    _createOverlay: function (message) {
//      if (this._overlay) return;

//      var msg = message || 'Processing... Please wait.';

//      var overlayHtml = [
//        '<div id="messageManagerLoadingOverlay" style="',
//        'position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
//        'background-color: rgba(0, 0, 0, 0.6); z-index: 99999;',
//        'display: flex; justify-content: center; align-items: center;">',
//        '<div style="background: white; padding: 30px 40px; border-radius: 8px;',
//        'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); text-align: center; min-width: 300px;">',
//        '<div style="margin-bottom: 20px;">',
//        '<div style="width: 40px; height: 40px; border: 4px solid #f3f3f3;',
//        'border-top: 4px solid #007bff; border-radius: 50%;',
//        'animation: spin 1s linear infinite; margin: 0 auto 15px auto;"></div>',
//        '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>',
//        '</div>',
//        '<div style="font-size: 16px; color: #333; font-weight: 500;">',
//        msg,
//        '</div>',
//        '<div style="font-size: 12px; color: #666; margin-top: 10px;">',
//        'Please do not close or refresh the page',
//        '</div>',
//        '</div>',
//        '</div>'
//      ].join('');

//      this._overlay = $(overlayHtml);
//      $('body').append(this._overlay);
//      $('body').css('overflow', 'hidden');
//    },

//    // Private - Remove loading overlay
//    _removeOverlay: function () {
//      if (this._overlay) {
//        this._overlay.remove();
//        this._overlay = null;
//      }
//      $('#messageManagerLoadingOverlay').remove();
//      $('body').css('overflow', '');
//    }
//  };

//  // ============================================
//  // PUBLIC API
//  // ============================================

//  return {
//    // Modules
//    notify: Notification,
//    confirm: Confirmation,
//    alert: Alert,
//    loading: Loading,

//    // Backward compatibility helpers (deprecated)
//    showSuccess: function (message, title, timeOut) {
//      _logDeprecation('MessageManager.showSuccess', 'MessageManager.notify.success');
//      Notification.success(message, title, timeOut);
//    },

//    showError: function (message, title, timeOut) {
//      _logDeprecation('MessageManager.showError', 'MessageManager.notify.error');
//      Notification.error(message, title, timeOut);
//    },

//    showWarning: function (message, title, timeOut) {
//      _logDeprecation('MessageManager.showWarning', 'MessageManager.notify.warning');
//      Notification.warning(message, title, timeOut);
//    },

//    showInfo: function (message, title, timeOut) {
//      _logDeprecation('MessageManager.showInfo', 'MessageManager.notify.info');
//      Notification.info(message, title, timeOut);
//    }
//  };

//  // Private - Log deprecation warning
//  function _logDeprecation(oldMethod, newMethod) {
//    if (typeof console !== 'undefined' && console.warn) {
//      console.warn(
//        '%c[DEPRECATED] ' + oldMethod + ' is deprecated. Use ' + newMethod + ' instead.',
//        'color: orange; font-weight: bold;'
//      );
//    }
//  }
//})();

//// ============================================
//// Auto-initialization Check
//// ============================================
//(function () {
//  var missingDeps = [];

//  if (typeof CommonManager === 'undefined') {
//    missingDeps.push('CommonManager');
//  }
//  if (typeof ToastrMessage === 'undefined' && typeof toastr === 'undefined') {
//    missingDeps.push('ToastrMessage/toastr');
//  }

//  if (missingDeps.length > 0) {
//    console.warn(
//      '%c[MessageManager] Warning: Missing dependencies: ' + missingDeps.join(', ') +
//      '. Some features may not work properly.',
//      'color: orange; font-weight: bold;'
//    );
//  } else {
//    console.log(
//      '%c[MessageManager] ✓ Loaded successfully',
//      'color: #2196F3; font-weight: bold; font-size: 12px;'
//    );
//  }
//})();