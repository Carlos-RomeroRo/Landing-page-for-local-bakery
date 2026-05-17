export interface FadeFromConfig {
  y?: number;
  duration?: number;
  ease?: string;
  delay?: number;
  immediateRender?: boolean;
}

export function fadeFromVars(config: FadeFromConfig = {}) {
  return {
    opacity: 0,
    y: config.y ?? 24,
    duration: config.duration ?? 0.7,
    ease: config.ease ?? 'power3.out',
    delay: config.delay ?? 0,
    immediateRender: config.immediateRender ?? false,
  };
}
