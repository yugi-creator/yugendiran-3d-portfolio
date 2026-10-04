import { useState, useEffect, useRef } from 'react';

/**
 * Tracks which section is currently visible using IntersectionObserver.
 * Returns the ID of the currently active (most visible) section.
 */
export function useScrollSpy(sectionIds: string[], offset = 80): string | null {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [sectionIds, offset]);

  return activeId;
}
