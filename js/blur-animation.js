document.addEventListener("DOMContentLoaded", function () {
  const blurElements = document.querySelectorAll('[data-blur-animation="true"]');
  if (!blurElements.length) return;

  class BlurAnimation {
    constructor(element) {
      this.element = element;
      this.targetBlur = parseFloat(element.dataset.blurTarget) || 0;
      this.duration = parseFloat(element.dataset.blurDuration) || 3000;
      this.startTime = null;
      this.isAnimating = false;

      // Start animation after a small delay
      setTimeout(() => this.startAnimation(), 500);
    }

    startAnimation() {
      if (this.isAnimating || this.targetBlur <= 0) return;

      this.isAnimating = true;
      this.startTime = performance.now();
      this.animate();
    }

    animate(currentTime) {
      if (!this.startTime) this.startTime = currentTime;

      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // Use easing function for smooth animation
      const easedProgress = this.easeInOutQuad(progress);
      const currentBlur = easedProgress * this.targetBlur;

      this.element.style.filter = `blur(${currentBlur}px)`;

      if (progress < 1) {
        requestAnimationFrame((time) => this.animate(time));
      } else {
        this.isAnimating = false;
      }
    }

    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
  }

  // Initialize blur animations
  blurElements.forEach((element) => {
    new BlurAnimation(element);
  });
});
