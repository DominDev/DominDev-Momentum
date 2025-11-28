/**
 * lazy-blur.js
 *
 * Implements an advanced lazy-loading "blur-up" technique for images.
 * - Uses IntersectionObserver to detect when an image enters the viewport.
 * - Initially displays a small, blurred placeholder.
 * - Loads the full-resolution image in the background.
 * - Fades in the full image smoothly once loaded.
 */
const initLazyBlur = () => {
  const lazyImages = document.querySelectorAll('.lazy-img');

  if (!lazyImages.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;

          // Start loading the full image by setting srcset
          img.srcset = img.dataset.srcset || '';

          // When the full image is loaded (or if it's already cached)
          img.addEventListener('load', () => {
            img.classList.add('is-loaded');
          }, { once: true });

          // In case 'load' doesn't fire for cached images, check .complete
          if (img.complete) {
            img.classList.add('is-loaded');
          }

          // Stop observing this image
          observer.unobserve(img);
        }
      });
    },
    {
      // Start loading when the image is 200px away from the viewport
      rootMargin: '0px 0px 200px 0px',
    }
  );

  lazyImages.forEach((img) => {
    observer.observe(img);
  });
};

export { initLazyBlur };
