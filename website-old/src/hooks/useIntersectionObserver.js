import { RefObject, useEffect, useState } from 'react';

function useIntersectionObserver(
  elementRef,
  { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = true }
) {
  const [entry, setEntry] = useState();
  const [isIntersecting, setIsIntersecting] = useState();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]) => {
    setIsIntersecting(entry.isIntersecting);

    elementRef.current.classList.add('duration-300');
    elementRef.current.classList.add('transition-all');
    if (entry.isIntersecting) {
      elementRef.current.classList.remove('translate-y-[50%]');
      // elementRef.current.classList.remove('translate-x-[-50%]');
      elementRef.current.classList.remove('opacity-0');
    } else {
      elementRef.current.classList.add('translate-y-[50%]');
      // elementRef.current.classList.add('translate-x-[-50%]');
      elementRef.current.classList.add('opacity-0');
    }
    setEntry(entry);
  };

  console.log({ isIntersecting });

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    elementRef?.current,
    JSON.stringify(threshold),
    root,
    rootMargin,
    frozen
  ]);

  return entry;
}

export default useIntersectionObserver;
