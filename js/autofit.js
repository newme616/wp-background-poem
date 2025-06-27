document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll('[data-auto-fit-text="true"]');
  if (!containers.length) return;

  // Store cleanup functions for proper memory management
  const cleanupFunctions = [];

  const fitText = (container) => {
    const bg = container;
    const poemContainer = bg.querySelector(".hero-poem-blur-container");
    const textSpan = bg.querySelector(".hero-typewriter-target");

    if (!poemContainer || !textSpan) return;

    // Wait for the typewriter to initialize and content to be available
    const checkAndFit = () => {
      // Check if typewriter has created content
      const textContent = textSpan.textContent || textSpan.innerText;
      if (!textContent || textContent.length < 10) {
        setTimeout(checkAndFit, 100);
        return;
      }

      // Get viewport dimensions for better responsive handling
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get container dimensions (subtract padding)
      const bgRect = bg.getBoundingClientRect();
      const containerWidth = bgRect.width - 80; // Account for 2rem padding on each side (32px each)
      const containerHeight = bgRect.height - 80;

      if (containerWidth <= 0 || containerHeight <= 0) {
        setTimeout(checkAndFit, 100);
        return;
      }

      // Set responsive bounds based on viewport size
      let minFontSize = viewportWidth < 480 ? 6 : 8;
      let maxFontSize = Math.min(
        containerWidth / 8, // Text should not be wider than 1/8 of container per character
        containerHeight / 3, // Text should fit in height with some margin
        viewportWidth < 480 ? 24 : viewportWidth < 768 ? 48 : 120 // Responsive max
      );

      let bestFontSize = minFontSize;
      let iterations = 0;
      const maxIterations = 20; // Prevent infinite loops

      // Binary search for the best font size
      while (minFontSize <= maxFontSize && iterations < maxIterations) {
        const midFontSize = Math.floor((minFontSize + maxFontSize) / 2);

        // Apply the font size to the poem container
        poemContainer.style.fontSize = midFontSize + "px";

        // Force reflow and re-measurement
        poemContainer.offsetHeight;

        // Get actual text dimensions after applying font size
        const textRect = textSpan.getBoundingClientRect();

        // Use 85% of container to ensure comfortable fit with margin
        const fitsWidth = textRect.width <= containerWidth * 0.85;
        const fitsHeight = textRect.height <= containerHeight * 0.85;

        if (fitsWidth && fitsHeight) {
          bestFontSize = midFontSize;
          minFontSize = midFontSize + 1;
        } else {
          maxFontSize = midFontSize - 1;
        }

        iterations++;
      }

      // Apply the best font size with fallback
      if (bestFontSize >= minFontSize) {
        poemContainer.style.fontSize = bestFontSize + "px";
        console.log(`Auto-fit: Set font size to ${bestFontSize}px for container ${containerWidth}x${containerHeight}`);
      } else {
        // Fallback to responsive clamp based on viewport
        const fallbackSize =
          viewportWidth < 480
            ? "clamp(0.6rem, 1.5vw, 1.5rem)"
            : viewportWidth < 768
            ? "clamp(0.8rem, 2vw, 2rem)"
            : "clamp(1rem, 2.5vw, 3rem)";
        poemContainer.style.fontSize = fallbackSize;
        console.log(`Auto-fit: Using fallback responsive font size ${fallbackSize}`);
      }

      // Maintain the current text alignment settings
      poemContainer.style.display = "flex";

      // Don't override alignment - let CSS and PHP attributes handle positioning
      // Only ensure the container structure is maintained
    };

    // Start checking after typewriter has had time to initialize
    setTimeout(checkAndFit, 500);
  };

  containers.forEach((container) => {
    fitText(container);

    // Debounced resize event with different delays for different viewport changes
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      // Longer delay for mobile to reduce excessive recalculation
      const delay = window.innerWidth < 768 ? 400 : 250;
      timeout = setTimeout(() => fitText(container), delay);
    };

    window.addEventListener("resize", handleResize);
    // Also listen for orientation changes on mobile
    window.addEventListener("orientationchange", handleResize);

    // Store cleanup function
    cleanupFunctions.push(() => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(timeout);
    });

    // Use ResizeObserver for container size changes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(timeout);
        const delay = window.innerWidth < 768 ? 400 : 250;
        timeout = setTimeout(() => fitText(container), delay);
      });
      resizeObserver.observe(container);

      // Store cleanup function
      cleanupFunctions.push(() => {
        resizeObserver.disconnect();
      });
    }
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  });
});
