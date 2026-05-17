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
import Typed from 'typed.js';

@Directive({
  selector: '[appTyped]',
  standalone: true,
})
export class TypedDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private typed: Typed | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private manualFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private cachedStrings: string[] = [];
  private hasStarted = false;
  private visible = false;

  readonly text = input<string | undefined>(undefined, { alias: 'appTypedText' });
  readonly strings = input<string[] | undefined>(undefined, { alias: 'appTypedStrings' });
  readonly manual = input(false, { alias: 'appTypedManual', transform: booleanAttribute });
  readonly scroll = input(true, { alias: 'appTypedScroll', transform: booleanAttribute });
  readonly typeSpeed = input(28, { alias: 'appTypedTypeSpeed' });
  readonly startDelay = input(0, { alias: 'appTypedStartDelay' });
  readonly cursorChar = input('|', { alias: 'appTypedCursor' });
  readonly loop = input(false, { alias: 'appTypedLoop', transform: booleanAttribute });

  @HostBinding('class.app-typed-pending')
  get pendingClass(): boolean {
    return !this.visible;
  }

  constructor() {
    afterNextRender(
      () => {
        if (!isPlatformBrowser(this.platformId)) {
          this.initForServer();
          return;
        }
        requestAnimationFrame(() => this.init());
      },
      { injector: this.injector },
    );
  }

  private initForServer(): void {
    this.cachedStrings = this.resolveStrings();
    this.restoreFullText();
    this.visible = true;
  }

  private init(): void {
    this.cachedStrings = this.resolveStrings();

    if (!this.cachedStrings.length) {
      this.visible = true;
      return;
    }

    const element = this.host.nativeElement;
    element.setAttribute('dir', 'ltr');
    element.setAttribute('aria-label', this.cachedStrings.join(' '));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.restoreFullText();
      this.visible = true;
      return;
    }

    this.reserveHeight(this.cachedStrings[0]);
    element.textContent = '';

    if (this.manual()) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.restoreFullText();
        this.visible = true;
        return;
      }
      this.scheduleManualFallback();
      return;
    }

    if (this.scroll()) {
      this.observeViewport();
    } else {
      this.startTyped();
    }
  }

  /** Inicia la animación de escritura (p. ej. tras terminar la animación del título). */
  play(): void {
    if (!isPlatformBrowser(this.platformId) || this.hasStarted) {
      return;
    }

    if (!this.cachedStrings.length) {
      this.cachedStrings = this.resolveStrings();
    }

    if (!this.cachedStrings.length) {
      this.visible = true;
      return;
    }

    this.clearManualFallback();
    this.startTyped();
  }

  private scheduleManualFallback(): void {
    this.manualFallbackTimer = setTimeout(() => {
      if (!this.hasStarted) {
        this.restoreFullText();
        this.visible = true;
      }
    }, 5000);
  }

  private clearManualFallback(): void {
    if (this.manualFallbackTimer !== null) {
      clearTimeout(this.manualFallbackTimer);
      this.manualFallbackTimer = null;
    }
  }

  private observeViewport(): void {
    const element = this.host.nativeElement;

    const tryStart = (): void => {
      if (this.hasStarted) {
        return;
      }
      if (this.isInViewport(element)) {
        this.clearScrollFallback();
        this.startTyped();
        this.disconnectObserver();
      }
    };

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.clearScrollFallback();
          this.startTyped();
          this.disconnectObserver();
        }
      },
      { threshold: 0, rootMargin: '40px 0px 40px 0px' },
    );

    this.intersectionObserver.observe(element);

    requestAnimationFrame(() => {
      tryStart();
      requestAnimationFrame(tryStart);
    });

    this.scrollFallbackTimer = setTimeout(() => {
      if (!this.hasStarted) {
        this.restoreFullText();
        this.visible = true;
        this.disconnectObserver();
      }
    }, 2500);
  }

  private isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh && rect.bottom > 0;
  }

  private clearScrollFallback(): void {
    if (this.scrollFallbackTimer !== null) {
      clearTimeout(this.scrollFallbackTimer);
      this.scrollFallbackTimer = null;
    }
  }

  private startTyped(): void {
    if (this.hasStarted) {
      return;
    }

    const strings = this.cachedStrings.length ? this.cachedStrings : this.resolveStrings();
    if (!strings.length) {
      this.visible = true;
      return;
    }

    this.hasStarted = true;
    this.visible = true;

    const element = this.host.nativeElement;
    element.textContent = '';

    try {
      this.typed?.destroy();
      this.typed = new Typed(element, {
        strings,
        typeSpeed: this.typeSpeed(),
        startDelay: this.startDelay(),
        showCursor: true,
        cursorChar: this.cursorChar(),
        loop: this.loop(),
        fadeOut: false,
        smartBackspace: false,
        backSpeed: 0,
        contentType: 'null',
        autoInsertCss: true,
        onComplete: (typed) => {
          element.setAttribute('aria-label', strings.join(' '));
          typed.cursor?.remove();
        },
      });
    } catch {
      this.restoreFullText();
    }
  }

  private resolveStrings(): string[] {
    const many = this.strings()?.filter((value) => value.trim().length > 0);
    if (many?.length) {
      return many;
    }

    const single = this.text()?.trim();
    return single ? [single] : [];
  }

  private reserveHeight(sample: string): void {
    const element = this.host.nativeElement;
    element.textContent = sample;
    const reservedHeight = element.offsetHeight;
    element.textContent = '';

    if (reservedHeight > 0) {
      element.style.minHeight = `${reservedHeight}px`;
    }
  }

  private restoreFullText(): void {
    const text = this.cachedStrings[0] ?? this.text()?.trim() ?? '';
    this.host.nativeElement.textContent = text;
  }

  private disconnectObserver(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }

  ngOnDestroy(): void {
    this.typed?.destroy();
    this.typed = null;
    this.clearScrollFallback();
    this.clearManualFallback();
    this.disconnectObserver();
  }
}
