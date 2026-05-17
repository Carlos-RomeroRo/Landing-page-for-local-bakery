import type { gsap as GsapNamespace } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { FadeFromConfig } from './fade.preset';

type GsapInstance = typeof GsapNamespace;

export interface ScrollRevealConfig extends FadeFromConfig {
  start?: string;
  onComplete?: () => void;
}

export interface ScrollRevealHandle {
  play: () => void;
}

/**
 * Fade-up al entrar en viewport. El estado inicial lo define CSS (`.app-fade-pending`)
 * o el fromTo al ejecutar `play()` — no se fuerza opacity:0 al montar.
 */
export function createScrollReveal(
  gsap: GsapInstance,
  target: Element,
  config: ScrollRevealConfig = {},
): ScrollRevealHandle {
  const {
    start = 'top 88%',
    onComplete,
    y = 24,
    duration = 0.7,
    delay = 0,
    ease = 'power3.out',
  } = config;

  let hasPlayed = false;

  const play = (): void => {
    if (hasPlayed) {
      return;
    }
    hasPlayed = true;

    gsap.fromTo(
      target,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        overwrite: 'auto',
        onComplete: () => {
          onComplete?.();
        },
      },
    );
  };

  ScrollTrigger.create({
    trigger: target,
    start,
    once: true,
    invalidateOnRefresh: true,
    onEnter: play,
  });

  return { play };
}

/** Compatibilidad con timeline y otros usos que cargan GSAP + ScrollTrigger. */
export function scrollRevealFrom(
  gsap: GsapInstance,
  target: Element,
  config: ScrollRevealConfig = {},
): ScrollRevealHandle {
  return createScrollReveal(gsap, target, config);
}
