import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

import { loadGsap, loadGsapWithScrollTrigger } from '../core/gsap-loader';
import { refreshScrollTriggers } from '../core/scroll-trigger.util';
import { createScrollReveal } from '../presets/scroll-reveal.preset';

@Directive({
  selector: '[appFade]',
  standalone: true,
})
export class FadeDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private revertContext: (() => void) | null = null;
  private revealed = false;
  private scrollRevealPlay: (() => void) | null = null;

  @HostBinding('class.app-fade-pending')
  get pendingClass(): boolean {
    return !this.revealed;
  }

  @HostBinding('style.--app-fade-y.px')
  get fadeOffsetY(): number | null {
    return !this.revealed ? this.y() : null;
  }

  /** Si es true, el fade se dispara al entrar en el viewport (ScrollTrigger). */
  readonly scroll = input(false, { alias: 'appFadeScroll', transform: booleanAttribute });
  readonly duration = input(0.7, { alias: 'appFadeDuration' });
  readonly y = input(24, { alias: 'appFadeY' });
  readonly delay = input(0, { alias: 'appFadeDelay' });
  readonly ease = input('power3.out', { alias: 'appFadeEase' });

  constructor() {
    afterNextRender(
      () => {
        if (!isPlatformBrowser(this.platformId)) {
          this.revealed = true;
          return;
        }
        void this.play();
      },
      { injector: this.injector },
    );
  }

  private async play(): Promise<void> {
    const element = this.host.nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.revealed = true;
      return;
    }

    const fadeConfig = {
      y: this.y(),
      duration: this.duration(),
      delay: this.delay(),
      ease: this.ease(),
    };

    const markRevealed = (): void => {
      this.revealed = true;
    };

    if (this.scroll()) {
      const gsap = await loadGsapWithScrollTrigger();
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      const ctx = gsap.context(() => {
        const handle = createScrollReveal(gsap, element, {
          ...fadeConfig,
          onComplete: markRevealed,
        });
        this.scrollRevealPlay = handle.play;
      }, element);

      await refreshScrollTriggers();

      if (ScrollTrigger.isInViewport(element)) {
        this.scrollRevealPlay?.();
      }

      this.revertContext = () => ctx.revert();
      return;
    }

    const gsap = await loadGsap();

    const ctx = gsap.context(() => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: fadeConfig.duration,
        delay: fadeConfig.delay,
        ease: fadeConfig.ease,
        overwrite: 'auto',
        onComplete: markRevealed,
      });
    }, element);

    this.revertContext = () => ctx.revert();
  }

  ngOnDestroy(): void {
    this.revertContext?.();
    this.revertContext = null;
    this.scrollRevealPlay = null;
  }
}
