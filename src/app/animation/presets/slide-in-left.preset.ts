import type { gsap as GsapNamespace } from 'gsap';

type GsapInstance = typeof GsapNamespace;

export interface SlideInLeftConfig {
  x?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  immediateRender?: boolean;
}

export interface ScrollSlideInLeftConfig extends SlideInLeftConfig {
  start?: string;
}

export function slideInLeftFromVars(config: SlideInLeftConfig = {}) {
  return {
    opacity: 0,
    x: config.x ?? -80,
    duration: config.duration ?? 0.85,
    ease: config.ease ?? 'power3.out',
    delay: config.delay ?? 0,
    immediateRender: config.immediateRender ?? false,
  };
}

export function slideInLeftToVars(config: SlideInLeftConfig = {}) {
  return {
    opacity: 1,
    x: 0,
    duration: config.duration ?? 0.85,
    ease: config.ease ?? 'power3.out',
    delay: config.delay ?? 0,
  };
}

export function scrollRevealSlideInLeft(
  gsap: GsapInstance,
  target: Element,
  config: ScrollSlideInLeftConfig = {},
) {
  const { start = 'top 88%', ...slideConfig } = config;

  return gsap.from(target, {
    ...slideInLeftFromVars(slideConfig),
    scrollTrigger: {
      trigger: target,
      start,
      toggleActions: 'play none none none',
      once: true,
      invalidateOnRefresh: true,
    },
  });
}
