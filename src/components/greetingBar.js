/**
 * greetingBar.js — Renders the contextual greeting message
 */

import { animateContent, setHTML } from '../utils/dom.js';

/**
 * Update the greeting bar with a new message.
 * @param {string} greetingHTML — may contain <strong> tags
 */
export function renderGreeting(greetingHTML) {
  const element = document.getElementById('greeting-text');
  if (element?.innerHTML === greetingHTML) return;
  setHTML('greeting-text', greetingHTML);
  animateContent(element);
}
