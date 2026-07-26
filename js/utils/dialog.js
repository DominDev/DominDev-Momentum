const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(dialog) {
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    return !element.hasAttribute('hidden') && element.getClientRects().length > 0;
  });
}

function inertOutsideDialog(dialog) {
  const changed = [];
  let current = dialog;

  while (current.parentElement) {
    const parent = current.parentElement;
    [...parent.children].forEach((sibling) => {
      if (sibling === current || ['SCRIPT', 'STYLE', 'LINK', 'META'].includes(sibling.tagName)) return;
      changed.push({ element: sibling, inert: sibling.inert });
      sibling.inert = true;
    });
    current = parent;
    if (current === document.body) break;
  }

  return () => {
    changed.reverse().forEach(({ element, inert }) => {
      element.inert = inert;
    });
  };
}

export function createDialogController({
  dialog,
  labelledBy,
  describedBy,
  initialFocus,
  onEscape,
}) {
  if (!dialog) return null;

  const dialogSurface = dialog.querySelector('.modal-content') || dialog;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  if (labelledBy) dialog.setAttribute('aria-labelledby', labelledBy);
  if (describedBy) dialog.setAttribute('aria-describedby', describedBy);
  if (!dialogSurface.hasAttribute('tabindex')) dialogSurface.setAttribute('tabindex', '-1');

  let lastFocusedElement = null;
  let restoreOutside = null;
  let focusTimer = null;

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements(dialog);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogSurface.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return {
    rememberTrigger() {
      lastFocusedElement = document.activeElement;
    },
    activate() {
      if (!lastFocusedElement) lastFocusedElement = document.activeElement;
      restoreOutside?.();
      restoreOutside = inertOutsideDialog(dialog);
      document.addEventListener('keydown', handleKeydown);

      let remainingAttempts = 5;
      const moveFocusInside = () => {
        if (remainingAttempts <= 0 || dialog.getAttribute('aria-hidden') === 'true') return;
        const target = initialFocus || getFocusableElements(dialog)[0] || dialogSurface;
        target.focus({ preventScroll: true });
        remainingAttempts -= 1;
        if (document.activeElement !== target) {
          focusTimer = window.setTimeout(moveFocusInside, 50);
        }
      };

      // Chromium may evict focus asynchronously after `inert` is applied.
      // Retry briefly instead of leaving keyboard focus on the document body.
      focusTimer = window.setTimeout(moveFocusInside, 50);
    },
    deactivate() {
      window.clearTimeout(focusTimer);
      focusTimer = null;
      document.removeEventListener('keydown', handleKeydown);
      restoreOutside?.();
      restoreOutside = null;

      if (lastFocusedElement?.isConnected && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      } else {
        document.body.focus();
      }
      lastFocusedElement = null;
    },
  };
}
