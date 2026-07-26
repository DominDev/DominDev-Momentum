/**
 * @module PrivacyPolicy
 * @description Handles the Privacy Policy modal interactions.
 */

export function initPrivacyPolicy() {
  const modal = document.getElementById('privacy-modal');
  const closeBtn = document.getElementById('privacy-close-btn');
  const triggers = document.querySelectorAll('.privacy-trigger');
  const content = modal?.querySelector('.privacy-content');
  let contentPromise = null;

  if (!modal || !closeBtn) {
    console.warn('Privacy Policy Modal or Close Button not found.');
    return;
  }

  function setupAccordions() {
    const details = modal.querySelectorAll('.privacy-details');
    details.forEach((targetDetail) => {
      targetDetail.addEventListener('toggle', () => {
        if (!targetDetail.open) return;
        details.forEach((detail) => {
          if (detail !== targetDetail) detail.removeAttribute('open');
        });
      });
    });
  }

  async function ensureContent() {
    if (!content) return;
    if (contentPromise) return contentPromise;

    content.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'privacy-faq-disclaimer',
      textContent: 'Ładuję politykę prywatności…',
    }));

    contentPromise = import('./privacy-policy-content.js')
      .then(({ PRIVACY_POLICY_HTML }) => {
        content.innerHTML = PRIVACY_POLICY_HTML;
        setupAccordions();
      })
      .catch(() => {
        content.innerHTML = '<h2 id="privacy-title">Polityka prywatności</h2><p>Nie udało się załadować dokumentu. Napisz na <strong>contact@domindev.com</strong>, aby otrzymać jego aktualną treść.</p>';
      });

    return contentPromise;
  }

  async function openModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    await ensureContent();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const url = new URL(window.location.href);
    if (url.searchParams.get('privacy') === '1') {
      url.searchParams.delete('privacy');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', openModal);
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="close-privacy"]')) {
      closeModal();
      return;
    }
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (new URLSearchParams(window.location.search).get('privacy') === '1') {
    openModal();
  }
}
