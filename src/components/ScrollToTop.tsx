import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component handles scroll restoration for SPA navigation.
 * - Scrolls to top on route changes (pathname change)
 * - Preserves anchor link behavior (hash navigation)
 * - Does not interfere with browser back/forward navigation
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if pathname changed (not just hash)
    if (prevPathRef.current !== pathname) {
      // If there's a hash, let the browser handle anchor scrolling
      if (hash) {
        // Small delay to ensure DOM is ready for anchor
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1));
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      } else {
        // Scroll to top instantly for better UX (no jarring delayed scroll)
        window.scrollTo(0, 0);
      }
    }
    
    prevPathRef.current = pathname;
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
