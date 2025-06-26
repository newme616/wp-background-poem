document.addEventListener("DOMContentLoaded", function () {
  const targets = document.querySelectorAll(".hero-typewriter-target");
  if (!targets.length) return;

  class TypewriterEffect {
    constructor(element) {
      this.element = element;
      this.text = element.dataset.text || "";
      this.baseSpeed = parseInt(element.dataset.typingSpeed) || 90;
      this.startDelay = parseInt(element.dataset.startDelay) || 0;
      this.currentIndex = 0;
      this.isTyping = false;

      // Initialize the element
      this.element.innerHTML = '<span class="cursor"></span>';
      this.cursor = this.element.querySelector(".cursor");
      this.textContainer = document.createElement("span");
      this.element.insertBefore(this.textContainer, this.cursor);

      // Start typing after delay
      setTimeout(() => this.startTyping(), this.startDelay);
    }

    startTyping() {
      if (this.isTyping || this.currentIndex >= this.text.length) return;
      this.isTyping = true;
      this.typeNextCharacter();
    }

    typeNextCharacter() {
      if (this.currentIndex >= this.text.length) {
        this.isTyping = false;
        return;
      }

      const currentChar = this.text[this.currentIndex];
      this.textContainer.textContent += currentChar;
      this.currentIndex++;

      // Calculate next delay with realistic variations
      let nextDelay = this.calculateDelay(currentChar);

      // Add natural typing rhythm variations
      nextDelay += this.getRandomVariation();

      setTimeout(() => this.typeNextCharacter(), nextDelay);
    }

    calculateDelay(char) {
      let speed = this.baseSpeed;

      // Different speeds for different characters (realistic typing)
      if (char === " ") {
        speed *= 0.5; // Spaces are faster
      } else if (char === "\n") {
        speed *= 3; // Line breaks take longer
      } else if (/[.!?]/.test(char)) {
        speed *= 2.5; // Punctuation pauses
      } else if (/[,;:]/.test(char)) {
        speed *= 1.5; // Minor punctuation
      } else if (/[A-Z]/.test(char)) {
        speed *= 1.2; // Capital letters slightly slower
      } else if (/[0-9]/.test(char)) {
        speed *= 1.3; // Numbers are a bit slower
      }

      // Add pauses after sentences
      if (this.currentIndex > 0) {
        const prevChar = this.text[this.currentIndex - 1];
        if (/[.!?]/.test(prevChar)) {
          speed *= 4; // Long pause after sentence
        }
      }

      // Occasional thinking pauses (random)
      if (Math.random() < 0.03) {
        // 3% chance
        speed *= 3;
      }

      return speed;
    }

    getRandomVariation() {
      // Add ±20% random variation to make it feel human
      const variation = this.baseSpeed * 0.2;
      return (Math.random() - 0.5) * variation;
    }
  }

  // Enhanced cursor blinking that syncs with typing
  function enhanceCursorBlink() {
    const cursors = document.querySelectorAll(".hero-typewriter-target .cursor");
    cursors.forEach((cursor) => {
      // Add slight random offset to cursor blink timing
      const delay = Math.random() * 500;
      cursor.style.animationDelay = delay + "ms";
    });
  }

  // Initialize all typewriter effects
  targets.forEach((target) => {
    new TypewriterEffect(target);
  });

  // Enhance cursor animations
  enhanceCursorBlink();
});
