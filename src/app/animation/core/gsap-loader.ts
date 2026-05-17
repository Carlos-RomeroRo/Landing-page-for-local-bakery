import type { gsap as GsapNamespace } from 'gsap';

type GsapInstance = typeof GsapNamespace;

let gsapPromise: Promise<GsapInstance> | null = null;
let gsapWithScrollTriggerPromise: Promise<GsapInstance> | null = null;

export function loadGsap(): Promise<GsapInstance> {
  if (!gsapPromise) {
    gsapPromise = import('gsap').then((module) => module.gsap);
  }
  return gsapPromise;
}

export function loadGsapWithScrollTrigger(): Promise<GsapInstance> {
  if (!gsapWithScrollTriggerPromise) {
    gsapWithScrollTriggerPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return gsap;
    });
  }
  return gsapWithScrollTriggerPromise;
}
