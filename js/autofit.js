document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll('[data-auto-fit-text="true"]');
  if (!containers.length) return;

  const fitText = (container) => {
    const bg = container.querySelector(".hero-landing-poem-bg");
    const textSpan = bg.querySelector(".hero-typewriter-target");
    if (!bg || !textSpan) return;

    // Wait for the typewriter to initialize
    const checkAndFit = () => {
      const textContainer = textSpan.querySelector("span:not(.cursor)");
      if (!textContainer) {
        setTimeout(checkAndFit, 100);
        return;
      }

      let minFontSize = 8;
      let maxFontSize = 300; // Increased max size for full container
      let midFontSize;
      let currentFontSize = minFontSize;

      // Clear any existing font size
      textSpan.style.fontSize = "";

      // Binary search for the best font size
      while (minFontSize <= maxFontSize) {
        midFontSize = Math.floor((minFontSize + maxFontSize) / 2);
        textSpan.style.fontSize = midFontSize + "px";

        // Check for overflow with some padding margin
        const bgRect = bg.getBoundingClientRect();
        const textRect = textContainer.getBoundingClientRect();

        // Use 90% of container to ensure good fit
        const fitsWidth = textRect.width <= bgRect.width * 0.9;
        const fitsHeight = textRect.height <= bgRect.height * 0.9;

        if (fitsWidth && fitsHeight) {
          currentFontSize = midFontSize;
          minFontSize = midFontSize + 1;
        } else {
          maxFontSize = midFontSize - 1;
        }
      }

      if (currentFontSize) {
        textSpan.style.fontSize = currentFontSize + "px";
      }
    };

    // Start checking after a small delay to let typewriter initialize
    setTimeout(checkAndFit, 200);
  };

  containers.forEach((container) => {
    fitText(container);

    // Debounced resize event
    let timeout;
    window.addEventListener("resize", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fitText(container), 150);
    });

    // Also listen for container size changes (for dynamic layouts)
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fitText(container), 150);
    });
    resizeObserver.observe(container);
  });
});
