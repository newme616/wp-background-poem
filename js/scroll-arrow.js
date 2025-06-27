(function () {
  "use strict";

  // Ensure this runs after DOM is ready and avoid conflicts
  function initScrollArrows() {
    try {
      const arrows = document.querySelectorAll(".scroll-down");
      if (!arrows.length) return;

      arrows.forEach((arrow) => {
        const heroContainer = arrow.closest(".hero-landing-poem-container");
        if (!heroContainer) return;

        // The arrow's 'bottom' position is now controlled by the block's settings via an inline style.
        // This script only handles hiding the arrow when the user scrolls past the hero container.

        const checkVisibility = () => {
          try {
            const containerRect = heroContainer.getBoundingClientRect();
            // Hide arrow if the hero container is completely scrolled out of view
            if (containerRect.bottom <= 0) {
              arrow.style.display = "none";
            } else {
              arrow.style.display = "flex";
            }
          } catch (error) {
            console.warn("Hero Landing Poem: Error checking visibility:", error);
          }
        };

        const handleScroll = () => {
          checkVisibility();
        };

        // We still need to check visibility on resize in case the container's height changes.
        let resizeTimeout;
        const handleResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(checkVisibility, 100);
        };

        if (window.addEventListener) {
          window.addEventListener("scroll", handleScroll, { passive: true });
          window.addEventListener("resize", handleResize, { passive: true });
        }

        setTimeout(checkVisibility, 100);

        const cleanup = () => {
          if (window.removeEventListener) {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
          }
          clearTimeout(resizeTimeout);
        };

        arrow.scrollArrowCleanup = cleanup;
      });

      if (window.addEventListener) {
        window.addEventListener("beforeunload", () => {
          document.querySelectorAll(".scroll-down").forEach((arrow) => {
            if (arrow.scrollArrowCleanup) {
              arrow.scrollArrowCleanup();
            }
          });
        });
      }
    } catch (error) {
      console.warn("Hero Landing Poem: Error initializing scroll arrows:", error);
    }
  }

  // Multiple initialization methods for better compatibility
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollArrows);
  } else {
    initScrollArrows();
  }

  // Fallback for WordPress environments
  if (typeof jQuery !== "undefined") {
    jQuery(document).ready(initScrollArrows);
  }
})();
