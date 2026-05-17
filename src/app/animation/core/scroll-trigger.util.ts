export async function refreshScrollTriggers(): Promise<void> {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}
