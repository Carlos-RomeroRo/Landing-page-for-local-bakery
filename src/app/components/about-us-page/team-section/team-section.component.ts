import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';

import { loadGsap, loadGsapWithScrollTrigger, onScrollEnterOnce } from '../../../animation';
import { TeamMember } from './team-member.interface';

@Component({
  selector: 'app-team-section',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  templateUrl: './team-section.component.html',
  styleUrl: './team-section.component.css',
})
export class TeamSectionComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private revertScroll: (() => void) | null = null;
  private memberAnimationRevert: (() => void) | null = null;

  readonly items = input<TeamMember[]>([]);
  readonly sectionLabel = input('Equipo');
  readonly sectionIntroTitle = input('Nuestros integrantes');
  readonly sectionIntroDescription = input(
    'Las personas que, con dedicación y oficio, llevan el sabor de Zapatoca a tu mesa cada día.',
  );

  readonly selectedId = signal<string | null>(null);
  readonly listPending = signal(true);

  readonly selectedMember = computed(() => {
    const members = this.items();
    if (!members.length) {
      return null;
    }
    const id = this.selectedId() ?? members[0].id;
    return members.find((member) => member.id === id) ?? members[0];
  });

  private readonly sectionRoot = viewChild<ElementRef<HTMLElement>>('sectionRoot');
  private readonly memberList = viewChild<ElementRef<HTMLElement>>('memberList');
  private readonly memberPhoto = viewChild<ElementRef<HTMLImageElement>>('memberPhoto');
  private readonly memberDetail = viewChild<ElementRef<HTMLElement>>('memberDetail');

  constructor() {
    afterNextRender(
      () => {
        const members = this.items();
        if (members.length) {
          this.selectedId.set(members[0].id);
        }

        if (!isPlatformBrowser(this.platformId)) {
          this.listPending.set(false);
          return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.listPending.set(false);
          return;
        }

        void this.initScrollAnimations();
      },
      { injector: this.injector },
    );
  }

  selectMember(member: TeamMember): void {
    if (member.id === this.selectedId()) {
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.selectedId.set(member.id);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.selectedId.set(member.id);
      return;
    }

    void this.animateMemberChange(member.id);
  }

  isSelected(member: TeamMember): boolean {
    return this.selectedMember()?.id === member.id;
  }

  private async initScrollAnimations(): Promise<void> {
    const section = this.sectionRoot()?.nativeElement;
    const list = this.memberList()?.nativeElement;
    if (!section || !list) {
      this.listPending.set(false);
      return;
    }

    const rows = Array.from(list.querySelectorAll<HTMLElement>('.team-member-row'));
    if (!rows.length) {
      this.listPending.set(false);
      return;
    }

    const gsap = await loadGsapWithScrollTrigger();
    const detail = this.memberDetail()?.nativeElement;
    const photo = this.memberPhoto()?.nativeElement;

    this.revertScroll = await onScrollEnterOnce(section, 'top 82%', () => {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.11,
          ease: 'power3.out',
          onComplete: () => this.listPending.set(false),
        },
      );

      if (photo && detail) {
        gsap.fromTo(
          [photo, detail],
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: 'power3.out',
            delay: 0.05,
          },
        );
      }
    });
  }

  private async animateMemberChange(nextMemberId: string): Promise<void> {
    const photo = this.memberPhoto()?.nativeElement;
    const detail = this.memberDetail()?.nativeElement;
    if (!photo || !detail) {
      this.selectedId.set(nextMemberId);
      return;
    }

    const gsap = await loadGsap();
    this.memberAnimationRevert?.();

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .to([photo, detail], {
          opacity: 0,
          y: 14,
          duration: 0.22,
          ease: 'power2.in',
        })
        .call(() => this.selectedId.set(nextMemberId))
        .to([photo, detail], {
          opacity: 1,
          y: 0,
          duration: 0.42,
          ease: 'power3.out',
        });
    });

    this.memberAnimationRevert = () => ctx.revert();
  }

  ngOnDestroy(): void {
    this.revertScroll?.();
    this.revertScroll = null;
    this.memberAnimationRevert?.();
    this.memberAnimationRevert = null;
  }
}
