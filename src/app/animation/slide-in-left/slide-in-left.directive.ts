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
  output,
  PLATFORM_ID,
} from '@angular/core';

import { onScrollEnterOnce } from '../core/scroll-once.util';
import { loadGsap } from '../core/gsap-loader';
import { slideInLeftToVars } from '../presets/slide-in-left.preset';

@Directive({
  selector: '[appSlideInLeft]',
  standalone: true,
})
export class SlideInLeftDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private revertContext: (() => void) | null = null;
  private revealed = false;

  readonly scroll = input(false, { alias: 'appSlideInLeftScroll', transform: booleanAttribute });
  readonly x = input(-80, { alias: 'appSlideInLeftX' });
  readonly duration = input(0.85, { alias: 'appSlideInLeftDuration' });
  readonly delay = input(0, { alias: 'appSlideInLeftDelay' });
  readonly ease = input('power3.out', { alias: 'appSlideInLeftEase' });
  readonly start = input('top 88%', { alias: 'appSlideInLeftStart' });

  /** Se emite cuando la animación de entrada termina (útil para encadenar el subtítulo). */
  readonly animationComplete = output<void>({ alias: 'appSlideInLeftComplete' });

  @HostBinding('class.app-slide-in-left-pending')
  get pendingClass(): boolean {
    return !this.revealed;
  }

  @HostBinding('style.--app-slide-x.px')
  get slideOffsetX(): number | null {
    return this.pendingClass ? this.x() : null;
  }

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
      this.animationComplete.emit();
      return;
    }

    const slideConfig = {
      x: this.x(),
      duration: this.duration(),
      delay: this.delay(),
      ease: this.ease(),
    };

    if (this.scroll()) {
      this.revertContext = await onScrollEnterOnce(element, this.start(), () => {
        void this.animateIn(slideConfig);
      });
      return;
    }

    await this.animateIn(slideConfig);
  }

  private async animateIn(
    slideConfig: {
      x?: number;
      duration?: number;
      delay?: number;
      ease?: string;
    },
  ): Promise<void> {
    const element = this.host.nativeElement;
    const gsap = await loadGsap();

    const ctx = gsap.context(() => {
      gsap.to(element, {
        ...slideInLeftToVars(slideConfig),
        onStart: () => {
          this.revealed = true;
        },
        onComplete: () => {
          this.animationComplete.emit();
        },
      });
    }, element);

    const previousRevert = this.revertContext;
    this.revertContext = () => {
      previousRevert?.();
      ctx.revert();
    };
  }

  ngOnDestroy(): void {
    this.revertContext?.();
    this.revertContext = null;
  }
}
