// Shared service navigation for the homepage and dedicated service landing pages.
// Pages without these controls retain their existing navigation behavior.
export function initServiceNavigation() {
  const desktopTrigger = document.getElementById('services-menu-trigger');
  const desktopDropdown = document.getElementById('services-dropdown');
  const mobileOpen = document.getElementById('mobile-services-open');
  const mobilePanel = document.getElementById('mobile-services-panel');
  const menu = document.getElementById('fullscreen-menu');
  const hamburger = document.getElementById('hamburger-menu');

  if (
    !desktopTrigger ||
    !desktopDropdown ||
    !mobileOpen ||
    !mobilePanel ||
    !menu ||
    !hamburger
  ) {
    return;
  }

  const setDesktopDropdown = (isOpen, { restoreFocus = false } = {}) => {
    desktopTrigger.setAttribute('aria-expanded', String(isOpen));
    desktopDropdown.hidden = !isOpen;

    if (isOpen) {
      desktopDropdown.classList.add('is-open');
    } else {
      desktopDropdown.classList.remove('is-open');
      if (restoreFocus) desktopTrigger.focus();
    }
  };

  const setMobileServicesPanel = (isOpen, { restoreFocus = false } = {}) => {
    mobileOpen.setAttribute('aria-expanded', String(isOpen));
    mobileOpen.setAttribute(
      'aria-label',
      isOpen ? 'Zwiń listę usług' : 'Rozwiń listę usług'
    );
    mobilePanel.hidden = !isOpen;

    if (!isOpen && restoreFocus) {
      mobileOpen.focus();
    }
  };

  desktopTrigger.addEventListener('click', () => {
    const isOpen = desktopTrigger.getAttribute('aria-expanded') === 'true';
    setDesktopDropdown(!isOpen);
  });

  desktopDropdown.addEventListener('click', (event) => {
    if (event.target.closest('a')) setDesktopDropdown(false);
  });

  document.addEventListener('click', (event) => {
    if (
      desktopTrigger.getAttribute('aria-expanded') === 'true' &&
      !desktopTrigger.contains(event.target) &&
      !desktopDropdown.contains(event.target)
    ) {
      setDesktopDropdown(false);
    }
  });

  document.addEventListener('focusin', (event) => {
    if (
      desktopTrigger.getAttribute('aria-expanded') === 'true' &&
      !desktopTrigger.contains(event.target) &&
      !desktopDropdown.contains(event.target)
    ) {
      setDesktopDropdown(false);
    }
  });

  mobileOpen.addEventListener('click', () => {
    const isOpen = mobileOpen.getAttribute('aria-expanded') === 'true';
    setMobileServicesPanel(!isOpen);
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMobileServicesPanel(false);
  });

  hamburger.addEventListener('click', () => {
    const isMenuOpen = menu.classList.contains('active');
    hamburger.setAttribute('aria-expanded', String(isMenuOpen));
    hamburger.setAttribute('aria-label', isMenuOpen ? 'Zamknij menu' : 'Otwórz menu');

    if (!isMenuOpen) {
      setMobileServicesPanel(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (desktopTrigger.getAttribute('aria-expanded') === 'true') {
      setDesktopDropdown(false, { restoreFocus: true });
      return;
    }

    if (!mobilePanel.hidden) {
      setMobileServicesPanel(false, { restoreFocus: true });
      return;
    }

    if (menu.classList.contains('active')) {
      hamburger.click();
      hamburger.focus();
    }
  });
}
