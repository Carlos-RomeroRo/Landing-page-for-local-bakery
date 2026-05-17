import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import {
  FadeDirective,
  loadGsapWithScrollTrigger,
  refreshScrollTriggers,
  scrollRevealFrom,
} from '../../../animation';

import { TimelineItem } from './timeline-item.interface';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [FadeDirective],
  templateUrl: './timeline.component.html',
})
export class TimelineComponent implements OnDestroy {
  @Input() items: TimelineItem[] = [];

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private revertContext: (() => void) | null = null;

  constructor() {
    afterNextRender(
      () => {
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        void this.initScrollReveal();
      },
      { injector: this.injector },
    );
  }

  private async initScrollReveal(): Promise<void> {
    const root = this.host.nativeElement;
    const rows = Array.from(root.querySelectorAll('.timeline-row')) as HTMLElement[];
    if (!rows.length) {
      return;
    }

    const gsap = await loadGsapWithScrollTrigger();

    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    const playReveal: Array<() => void> = [];

    const ctx = gsap.context(() => {
      rows.forEach((row) => {
        const handle = scrollRevealFrom(gsap, row, { y: 40, duration: 0.6 });
        playReveal.push(handle.play);
      });
    }, root);

    await refreshScrollTriggers();

    rows.forEach((row, index) => {
      if (ScrollTrigger.isInViewport(row)) {
        playReveal[index]?.();
      }
    });

    this.revertContext = () => ctx.revert();
  }

  ngOnDestroy(): void {
    this.revertContext?.();
    this.revertContext = null;
  }
}
