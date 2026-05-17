import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';

import { loadGsapWithScrollTrigger } from '../../../animation';
import { IconComponent } from '../../shared/icon';
import { AchievementStat } from './achievement-stat.interface';

@Component({
  selector: 'app-achievements-section',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  imports: [IconComponent],
  templateUrl: './achievements-section.component.html',
  styleUrl: './achievements-section.component.css',
})
export class AchievementsSectionComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private revertAnimations: (() => void) | null = null;

  readonly items = input<AchievementStat[]>([]);
  readonly sectionLabel = input('Logros');
  readonly sectionEyebrow = input('Una base para crecer');
  readonly sectionTitleLead = input('Logros que impulsan ');
  readonly sectionTitleAccent = input('nuestra historia');
  readonly sectionDescription = input(
    'Cifras y hitos que reflejan el compromiso diario de Panadería Zapatoca con la calidad, la comunidad y la tradición panadera.',
  );

  readonly cardsPending = signal(true);

  private readonly sectionRoot = viewChild<ElementRef<HTMLElement>>('sectionRoot');
  private readonly sectionIntro = viewChild<ElementRef<HTMLElement>>('sectionIntro');
  private readonly cardsColumn = viewChild<ElementRef<HTMLElement>>('cardsColumn');

  constructor() {
    afterNextRender(
      () => {
        if (!isPlatformBrowser(this.platformId)) {
          this.cardsPending.set(false);
          return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.cardsPending.set(false);
          return;
        }

        void this.initScrollAnimations();
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    this.revertAnimations?.();
    this.revertAnimations = null;
  }

  private async initScrollAnimations(): Promise<void> {
    const section = this.sectionRoot()?.nativeElement;
    const intro = this.sectionIntro()?.nativeElement;
    const column = this.cardsColumn()?.nativeElement;
    if (!section || !column) {
      this.cardsPending.set(false);
      return;
    }

    const cards = Array.from(column.querySelectorAll<HTMLElement>('.achievements-card'));
    if (!cards.length) {
      this.cardsPending.set(false);
      return;
    }

    const gsap = await loadGsapWithScrollTrigger();
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');

    const ctx = gsap.context(() => {
      if (intro) {
        gsap.from(intro, {
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            once: true,
          },
          opacity: 0,
          x: -32,
          duration: 0.75,
          ease: 'power3.out',
        });
      }

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 56 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: index * 0.04,
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
              invalidateOnRefresh: true,
            },
            onComplete: () => {
              card.classList.remove('achievements-card--pending');
              if (index === cards.length - 1) {
                this.cardsPending.set(false);
              }
            },
          },
        );
      });
    }, section);

    ScrollTrigger.refresh();
    this.revertAnimations = () => ctx.revert();
  }
}
