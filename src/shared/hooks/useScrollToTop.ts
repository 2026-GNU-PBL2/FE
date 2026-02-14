//src/shared/hooks/useScrollToTop.ts

export function useScrollToTop() {
  const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({ top: 0, behavior });
  };

  return { scrollToTop };
}
