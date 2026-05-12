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

import { TimelineItem } from './timeline-item.interface';

@Component({
  selector: 'app-timeline',
  standalone: true,
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

    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      rows.forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: row,
            start: 'top 92%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    this.revertContext = () => ctx.revert();
  }

  ngOnDestroy(): void {
    this.revertContext?.();
    this.revertContext = null;
  }
}
