/**
 * Portfolio expansion module
 * Handles "Load more" functionality with lazy loading
 */

const BATCH_SIZE = 3;
let loadedCount = 0;
let isLoading = false;

export function initPortfolioExpand() {
  const grid = document.getElementById('portfolio-grid');
  const button = document.getElementById('portfolio-load-more');
  const template = document.getElementById('portfolio-template');

  if (!grid || !button || !template) return;

  const templateCards = template.content.querySelectorAll('.project-card');
  const totalHidden = templateCards.length;

  if (totalHidden === 0) {
    button.hidden = true;
    return;
  }

  button.addEventListener('click', () => {
    if (isLoading) return;
    loadNextBatch(grid, templateCards, button);
  });
}

function loadNextBatch(grid, templateCards, button) {
  isLoading = true;
  button.disabled = true;

  const start = loadedCount;
  const end = Math.min(loadedCount + BATCH_SIZE, templateCards.length);

  const fragment = document.createDocumentFragment();
  const newCards = [];

  for (let i = start; i < end; i++) {
    const card = templateCards[i].cloneNode(true);
    card.classList.add('project-card--new');

    setupCardInteraction(card);

    fragment.appendChild(card);
    newCards.push(card);
  }

  grid.appendChild(fragment);
  loadedCount = end;

  button.setAttribute('aria-expanded', 'true');
  button.disabled = false;
  isLoading = false;

  const isLastBatch = loadedCount >= templateCards.length;

  if (isLastBatch) {
    button.hidden = true;
    if (newCards.length > 0) {
      newCards[0].focus();
    }
  }

  announceLoadedCards(end - start);
}

function setupCardInteraction(card) {
  const target = card.dataset.target;
  if (!target) return;

  card.addEventListener('click', () => window.openModal?.(target));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.openModal?.(target);
    }
  });
}

function announceLoadedCards(count) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Załadowano ${count} ${
    count === 1 ? 'nowy projekt' : 'nowe projekty'
  }.`;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
