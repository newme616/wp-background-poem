document.addEventListener("DOMContentLoaded", function () {
  const animatedElements = document.querySelectorAll('[data-opacity-animation="true"]');
  if (!animatedElements.length) return;

  // Respect "prefers-reduced-motion"
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    animatedElements.forEach((element) => {
      // Apply static opacity to each word without animation
      applyWordOpacity(element, false);
    });
    return;
  }

  class WordOpacityAnimation {
    constructor(element) {
      this.element = element;
      this.targetOpacity = parseFloat(element.dataset.opacityTarget) || 0.4;
      this.duration = parseFloat(element.dataset.opacityDuration) || 3000;
      this.startTime = null;
      this.isAnimating = false;
      this.rafId = null;

      // Start animation after a small delay to allow typewriter to finish
      setTimeout(() => this.startAnimation(), 1000);
    }

    startAnimation() {
      if (this.isAnimating) return;

      this.isAnimating = true;
      this.startTime = performance.now();
      this.animate();
    }

    animate() {
      const elapsed = performance.now() - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = this.easeInOutQuad(progress);

      // Apply opacity to words based on animation progress
      this.applyWordOpacityWithProgress(easedProgress);

      if (progress < 1) {
        this.rafId = requestAnimationFrame(() => this.animate());
      } else {
        // Ensure final state is applied
        this.applyWordOpacityWithProgress(1);
        this.isAnimating = false;
      }
    }

    applyWordOpacityWithProgress(progress) {
      const textSpan = this.element.querySelector(".hero-typewriter-target");
      if (!textSpan) return;

      // Get the text content
      const text = textSpan.textContent || textSpan.innerText;
      if (!text) return;

      // Split text into words (preserving whitespace and line breaks)
      const words = text.split(/(\s+)/);

      // Create or update word spans
      if (!textSpan.querySelector(".word-opacity")) {
        // First time: wrap each word in a span
        textSpan.innerHTML = words
          .map((word, index) => {
            if (word.trim() === "") {
              // Preserve whitespace
              return word;
            }
            return `<span class="word-opacity" data-word-index="${index}">${word}</span>`;
          })
          .join("");
      }

      // Apply opacity to each word
      const wordSpans = textSpan.querySelectorAll(".word-opacity");
      wordSpans.forEach((span, index) => {
        const wordIndex = parseInt(span.dataset.wordIndex);
        const wordProgress = Math.min(progress, (wordIndex + 1) / wordSpans.length);
        const wordOpacity = 1 - wordProgress * (1 - this.targetOpacity);
        span.style.opacity = wordOpacity;
      });
    }

    // Easing function for a smoother animation curve
    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Cleanup function to stop animation
    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    }
  }

  // Helper function to apply static word opacity (for reduced motion)
  function applyWordOpacity(element, animated = true) {
    const textSpan = element.querySelector(".hero-typewriter-target");
    if (!textSpan) return;

    const text = textSpan.textContent || textSpan.innerText;
    if (!text) return;

    const targetOpacity = parseFloat(element.dataset.opacityTarget) || 0.4;
    const words = text.split(/(\s+)/);

    // Wrap words in spans if not already done
    if (!textSpan.querySelector(".word-opacity")) {
      textSpan.innerHTML = words
        .map((word, index) => {
          if (word.trim() === "") {
            return word;
          }
          return `<span class="word-opacity" data-word-index="${index}">${word}</span>`;
        })
        .join("");
    }

    // Apply static opacity to each word
    const wordSpans = textSpan.querySelectorAll(".word-opacity");
    wordSpans.forEach((span, index) => {
      const wordIndex = parseInt(span.dataset.wordIndex);
      const wordOpacity = 1 - (wordIndex / wordSpans.length) * (1 - targetOpacity);
      span.style.opacity = wordOpacity;
    });
  }

  const animations = [];
  animatedElements.forEach((element) => {
    animations.push(new WordOpacityAnimation(element));
  });

  // Clean up animations on page unload to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    animations.forEach((animation) => animation.destroy());
  });
});
