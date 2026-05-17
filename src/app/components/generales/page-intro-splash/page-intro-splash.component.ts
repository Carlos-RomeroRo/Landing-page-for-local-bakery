import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { loadGsap } from '../../../animation';

/** Franja superior e inferior (rojo). */
const WAVE_TOP_FLAT = 'M0,0 H1440 V300 C1080,300 360,300 0,300 H0,0 Z';
const WAVE_TOP_WAVY = 'M0,0 H1440 V285 C1080,355 360,235 0,300 H0,0 Z';

/** Franja central (blanco). */
const WAVE_MIDDLE_FLAT = 'M0,300 H1440 V600 C1080,600 360,600 0,600 H0,300 Z';
const WAVE_MIDDLE_WAVY =
  'M0,300 H1440 V285 C1080,355 360,235 0,300 H1440 V615 C1080,555 360,675 0,600 H0,300 Z';

/** Franja inferior (rojo). */
const WAVE_BOTTOM_FLAT = 'M0,600 H1440 V900 C1080,900 360,900 0,900 H0,600 Z';
const WAVE_BOTTOM_WAVY = 'M0,615 H1440 V900 C1080,900 360,900 0,900 H0,615 Z';

const INTRO_DURATION = 2;

/** Rutas del navbar con página propia (sin contar fragmentos #home / #contacto). */
const NAV_ROUTE_KEYS = new Set(['', 'nosotros', 'productos']);

@Component({
  selector: 'app-page-intro-splash',
  standalone: true,
  host: {
    class: 'contents',
  },
  templateUrl: './page-intro-splash.component.html',
  styleUrl: './page-intro-splash.component.css',
})
export class PageIntroSplashComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private killTimeline: (() => void) | null = null;
  private lastRouteKey: string | null = null;
  private introQueued = false;

  readonly visible = signal(false);

  private readonly overlay = viewChild<ElementRef<HTMLElement>>('overlay');
  private readonly waveTop = viewChild<ElementRef<SVGPathElement>>('waveTop');
  private readonly waveMiddle = viewChild<ElementRef<SVGPathElement>>('waveMiddle');
  private readonly waveBottom = viewChild<ElementRef<SVGPathElement>>('waveBottom');
  private readonly tagline = viewChild<ElementRef<HTMLElement>>('tagline');
  private readonly words = viewChild<ElementRef<HTMLElement>>('words');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.onNavigation(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.stopIntro();
    if (isPlatformBrowser(this.platformId)) {
      this.unlockScroll();
    }
  }

  private onNavigation(url: string): void {
    const routeKey = this.routeKeyFromUrl(url);

    if (!NAV_ROUTE_KEYS.has(routeKey)) {
      return;
    }

    if (routeKey === this.lastRouteKey) {
      return;
    }

    this.lastRouteKey = routeKey;
    this.scheduleIntro();
  }

  /** Clave de ruta sin fragmento (#home, #contacto). */
  private routeKeyFromUrl(url: string): string {
    const tree = this.router.parseUrl(url);
    const primary = tree.root.children['primary'];
    return primary?.segments.map((segment) => segment.path).join('/') ?? '';
  }

  private scheduleIntro(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.visible.set(false);
      return;
    }

    this.stopIntro();
    this.introQueued = true;
    this.visible.set(false);

    queueMicrotask(() => {
      if (!this.introQueued) {
        return;
      }

      this.visible.set(true);

      afterNextRender(
        () => {
          if (!this.introQueued) {
            return;
          }
          this.introQueued = false;
          void this.runIntro();
        },
        { injector: this.injector },
      );
    });
  }

  private stopIntro(): void {
    this.introQueued = false;
    this.killTimeline?.();
    this.killTimeline = null;
    this.unlockScroll();
  }

  private async runIntro(): Promise<void> {
    const overlayEl = this.overlay()?.nativeElement;
    const topEl = this.waveTop()?.nativeElement;
    const middleEl = this.waveMiddle()?.nativeElement;
    const bottomEl = this.waveBottom()?.nativeElement;
    const taglineEl = this.tagline()?.nativeElement;
    const wordsEl = this.words()?.nativeElement;

    if (!overlayEl || !topEl || !middleEl || !bottomEl || !taglineEl || !wordsEl) {
      this.visible.set(false);
      return;
    }

    this.lockScroll();

    const gsap = await loadGsap();
    const wordSpans = wordsEl.querySelectorAll<HTMLElement>('.page-intro__word');

    gsap.killTweensOf([overlayEl, topEl, middleEl, bottomEl, taglineEl, wordSpans]);
    gsap.set(overlayEl, { opacity: 1, yPercent: 0, clearProps: 'transform' });
    gsap.set(taglineEl, { opacity: 0, y: 24 });
    gsap.set(wordSpans, { opacity: 0, y: 16, scale: 0.92 });
    gsap.set(topEl, { attr: { d: WAVE_TOP_FLAT }, x: 0 });
    gsap.set(middleEl, { attr: { d: WAVE_MIDDLE_FLAT }, x: 0 });
    gsap.set(bottomEl, { attr: { d: WAVE_BOTTOM_FLAT }, x: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        this.visible.set(false);
        this.unlockScroll();
      },
    });
    this.killTimeline = () => timeline.kill();

    timeline.to(taglineEl, { opacity: 1, y: 0, duration: 0.4 }, 0);

    timeline.to(
      wordSpans,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.08,
        ease: 'back.out(1.4)',
      },
      0.05,
    );

    timeline.to(topEl, { attr: { d: WAVE_TOP_WAVY }, duration: 1.2 }, 0.2);
    timeline.to(middleEl, { attr: { d: WAVE_MIDDLE_WAVY }, duration: 1.2 }, 0.2);
    timeline.to(bottomEl, { attr: { d: WAVE_BOTTOM_WAVY }, duration: 1.2 }, 0.2);

    timeline.to(
      [topEl, middleEl, bottomEl],
      {
        x: 18,
        duration: 0.6,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      },
      0.35,
    );

    timeline.to(overlayEl, { yPercent: -100, duration: 0.5, ease: 'power3.in' }, 1.5);

    timeline.duration(INTRO_DURATION);
  }

  private lockScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.documentElement.classList.add('page-intro-active');
  }

  private unlockScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.documentElement.classList.remove('page-intro-active');
  }
}
