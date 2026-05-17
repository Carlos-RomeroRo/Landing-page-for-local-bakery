import { loadGsapWithScrollTrigger } from './gsap-loader';
import { refreshScrollTriggers } from './scroll-trigger.util';

export async function onScrollEnterOnce(
  element: Element,
  start: string,
  onEnter: () => void,
): Promise<() => void> {
  const gsap = await loadGsapWithScrollTrigger();
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');

  let hasEntered = false;

  const run = (): void => {
    if (hasEntered) {
      return;
    }
    hasEntered = true;
    onEnter();
  };

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: element,
      start,
      once: true,
      invalidateOnRefresh: true,
      onEnter: run,
    });
  }, element);

  await refreshScrollTriggers();

  if (ScrollTrigger.isInViewport(element)) {
    run();
  }

  return () => ctx.revert();
}
