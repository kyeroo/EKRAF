/**
 * dom.js — DOM helper utilities
 */

import { iconSvg } from './icons.js';

export function animateContent(target) {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) return;

  element.classList.remove('content-enter');
  void element.offsetWidth;
  element.classList.add('content-enter');
  element.addEventListener('animationend', () => element.classList.remove('content-enter'), { once: true });
}

/* ---------------------------------------------------------
   Toast Notifications
   --------------------------------------------------------- */

const TOAST_DURATION = 3500;

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} [type]
 */
export function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    info: 'info',
    success: 'success',
    error: 'error',
    warning: 'warning',
  };

  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${iconSvg(icons[type])}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(el);

  // Auto dismiss
  setTimeout(() => {
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, TOAST_DURATION);
}

/* ---------------------------------------------------------
   Visibility helpers
   --------------------------------------------------------- */

/**
 * Show an element (remove 'hidden' class).
 * @param {string|HTMLElement} target
 */
export function show(target) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  el?.classList.remove('hidden');
}

/**
 * Hide an element (add 'hidden' class).
 * @param {string|HTMLElement} target
 */
export function hide(target) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  el?.classList.add('hidden');
}

/* ---------------------------------------------------------
   Safe DOM text/HTML setters
   --------------------------------------------------------- */

/**
 * Set text content of an element by ID.
 * @param {string} id
 * @param {string} text
 */
export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Set innerHTML of an element by ID.
 * Warning: only use with trusted/sanitized HTML.
 * @param {string} id
 * @param {string} html
 */
export function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ---------------------------------------------------------
   Vibe Theme Application
   --------------------------------------------------------- */

/**
 * Apply a vibe theme to the root html element.
 * @param {string} vibe
 */
export function applyVibe(vibe) {
  document.documentElement.setAttribute('data-vibe', vibe);
}

/* ---------------------------------------------------------
   Element creation helper
   --------------------------------------------------------- */

/**
 * Create an element with optional className and innerHTML.
 * @param {string} tag
 * @param {{ className?: string, html?: string, text?: string, attrs?: object }} [opts]
 * @returns {HTMLElement}
 */
export function el(tag, opts = {}) {
  const element = document.createElement(tag);
  if (opts.className) element.className = opts.className;
  if (opts.html !== undefined) element.innerHTML = opts.html;
  if (opts.text !== undefined) element.textContent = opts.text;
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => element.setAttribute(k, v));
  }
  return element;
}

/**
 * Clear all children of an element.
 * @param {HTMLElement|string} target
 */
export function clearEl(target) {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (element) element.innerHTML = '';
}
