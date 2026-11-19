/**
 * recommendations.js — Renders activity and food recommendation cards
 */

import { clearEl, el } from '../utils/dom.js';
import { iconSvg } from '../utils/icons.js';

/**
 * Render recommendation cards into the grid.
 * @param {{ activities: Rec[], foods: Rec[] }} recs
 */
export function renderRecommendations({ activities, foods }, filter = 'all') {
  const grid = document.getElementById('recs-grid');
  if (!grid) return;

  clearEl(grid);

  // Interleave: activity, food, activity, food...
  const maxLen = Math.max(activities.length, foods.length);
  const cards = [];

  for (let i = 0; i < maxLen; i++) {
    if (activities[i]) cards.push({ ...activities[i], type: 'activity' });
    if (foods[i]) cards.push({ ...foods[i], type: 'food' });
  }

  const visibleCards = filter === 'all' ? cards : cards.filter(rec => rec.type === filter);
  visibleCards.forEach((rec, idx) => {
    const card = createRecCard(rec, idx);
    grid.appendChild(card);
  });
}

/**
 * Create a single recommendation card DOM element.
 * @param {{ title: string, desc: string, type: string }} rec
 * @param {number} index — for staggered animation delay
 * @returns {HTMLElement}
 */
function createRecCard(rec, index) {
  const isFood = rec.type === 'food';
  const badgeClass = isFood ? 'badge-food' : 'badge-activity';
  const badgeLabel = isFood ? 'Kuliner' : 'Aktivitas';

  const card = el('div', {
    className: 'rec-card h-full',
    attrs: {
      role: 'listitem',
      'data-category': rec.type,
      style: `animation: fade-in-up 0.4s ${index * 0.07}s ease both;`,
    },
  });

  card.innerHTML = `
    <div class="rec-card-top">
      <span class="rec-icon bg-white/10 p-2 rounded-lg" aria-hidden="true">${iconSvg(isFood ? 'food' : 'activity', 20)}</span>
      <div>
        <span class="rec-category-badge ${badgeClass}">${badgeLabel}</span>
        <div class="rec-title">${rec.title}</div>
      </div>
    </div>
    <p class="rec-desc">${rec.desc}</p>
  `;

  return card;
}
