/**
 * greetingBar.js — Renders the contextual greeting message
 */

import { setHTML } from '../utils/dom.js';

/**
 * Update the greeting bar with a new message.
 * @param {string} greetingHTML — may contain <strong> tags
 */
export function renderGreeting(greetingHTML) {
  setHTML('greeting-text', greetingHTML);
}
