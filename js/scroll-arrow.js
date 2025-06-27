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

        // Function to position arrow correctly within its hero container
        const positionArrow = () => {
          try {
            const containerRect = heroContainer.getBoundingClientRect();
            const containerHeight = containerRect.height;

            // Calculate bottom position as percentage of container height
            // This ensures it works whether the component is full-screen or nested
            const bottomPosition = Math.min(containerHeight * 0.15, containerHeight - 60); // 15% or at least 60px from bottom
            arrow.style.bottom = bottomPosition + "px";
          } catch (error) {
            console.warn("Hero Landing Poem: Error positioning arrow:", error);
          }
        };

        // Function to check if hero container is still visible
        const checkVisibility = () => {
          try {
            const containerRect = heroContainer.getBoundingClientRect();

            // Hide arrow if the hero container is completely above the viewport
            // This means the user has scrolled past it
            if (containerRect.bottom <= 0) {
              arrow.style.display = "none";
            } else {
              // Show arrow if hero container is still visible
              arrow.style.display = "flex";
            }
          } catch (error) {
            console.warn("Hero Landing Poem: Error checking visibility:", error);
          }
        };

        // Initial positioning
        positionArrow();

        // Handle scroll events with immediate response
        const handleScroll = () => {
          checkVisibility();
        };

        // Handle resize events
        let resizeTimeout;
        const handleResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            positionArrow();
            checkVisibility();
          }, 100);
        };

        // Use passive listeners for better performance
        if (window.addEventListener) {
          window.addEventListener("scroll", handleScroll, { passive: true });
          window.addEventListener("resize", handleResize, { passive: true });
        }

        // Initial visibility check
        setTimeout(checkVisibility, 100);

        // Cleanup function
        const cleanup = () => {
          if (window.removeEventListener) {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
          }
          clearTimeout(resizeTimeout);
        };

        // Store cleanup function for potential future use
        arrow.scrollArrowCleanup = cleanup;
      });

      // Cleanup on page unload
      if (window.addEventListener) {
        window.addEventListener("beforeunload", () => {
          arrows.forEach((arrow) => {
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
