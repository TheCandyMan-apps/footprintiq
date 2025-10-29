import { useEffect, useRef } from "react";

interface AccessibilityOptions {
  announcePageChange?: boolean;
  focusOnMount?: boolean;
  skipToMainId?: string;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const { announcePageChange = true, focusOnMount = false, skipToMainId = "main-content" } = options;
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region announcer if it doesn't exist
    if (announcePageChange && !announcerRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, [announcePageChange]);

  const announce = (message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  };

  const focusMain = () => {
    const mainContent = document.getElementById(skipToMainId);
    if (mainContent) {
      mainContent.focus();
    }
  };

  useEffect(() => {
    if (focusOnMount) {
      // Small delay to ensure content is rendered
      setTimeout(focusMain, 100);
    }
  }, [focusOnMount]);

  return {
    announce,
    focusMain,
    skipToMainId,
  };
}

// Hook for managing focus trap in modals
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// Hook for keyboard navigation in lists
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    loop?: boolean;
    horizontal?: boolean;
  } = {}
) {
  const { loop = true, horizontal = false } = options;
  const currentIndex = useRef(0);

  const navigate = (direction: "next" | "prev") => {
    const step = direction === "next" ? 1 : -1;
    let newIndex = currentIndex.current + step;

    if (loop) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    }

    currentIndex.current = newIndex;
    items[newIndex]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";

    if (e.key === nextKey) {
      e.preventDefault();
      navigate("next");
    } else if (e.key === prevKey) {
      e.preventDefault();
      navigate("prev");
    } else if (e.key === "Home") {
      e.preventDefault();
      currentIndex.current = 0;
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      currentIndex.current = items.length - 1;
      items[items.length - 1]?.focus();
    }
  };

  return { handleKeyDown, currentIndex: currentIndex.current };
}
