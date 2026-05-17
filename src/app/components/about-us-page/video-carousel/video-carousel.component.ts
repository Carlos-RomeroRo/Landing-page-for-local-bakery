import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  signal,
  viewChild,
  ViewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SlideInLeftDirective, TypedDirective } from '../../../animation';
import { VideoCarouselItem } from './video-carousel-item.interface';

const MOBILE_VIDEOS_PER_PAGE = 1;
const TABLET_VIDEOS_PER_PAGE = 2;
const DESKTOP_VIDEOS_PER_PAGE = 4;
const TABLET_MEDIA_QUERY = '(min-width: 768px)';
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const DEFAULT_AUTO_PLAY_MS = 8000;

@Component({
  selector: 'app-video-carousel',
  standalone: true,
  host: {
    class: 'block w-full',
  },
  imports: [SlideInLeftDirective, TypedDirective],
  templateUrl: './video-carousel.component.html',
  styleUrl: './video-carousel.component.css',
})
export class VideoCarouselComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private tabletMediaQuery: MediaQueryList | null = null;
  private desktopMediaQuery: MediaQueryList | null = null;
  private readonly onBreakpointChange = (): void => this.applyVideosPerPage();

  readonly items = input<VideoCarouselItem[]>([]);
  readonly sectionTitle = input('Impresiónate con nuestro producto');
  readonly sectionDescription = input(
    'Descubre el proceso, la textura y el sabor de lo que sale de nuestro horno. Cada video es un pedacito de la tradición Zapatoca.',
  );
  readonly autoPlayMs = input(DEFAULT_AUTO_PLAY_MS);

  @ViewChildren('videoPlayer') private videoPlayers?: QueryList<ElementRef<HTMLVideoElement>>;

  private readonly subtitleTyped = viewChild('subtitleTyped', { read: TypedDirective });

  readonly currentPage = signal(0);
  readonly videosPerPage = signal(MOBILE_VIDEOS_PER_PAGE);

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  private autoPlayPaused = false;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.items().length / this.videosPerPage())),
  );

  readonly pageIndexes = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index),
  );

  readonly pages = computed(() => {
    const all = this.items();
    const perPage = this.videosPerPage();
    const pageCount = this.totalPages();
    return Array.from({ length: pageCount }, (_, pageIndex) =>
      all.slice(pageIndex * perPage, pageIndex * perPage + perPage),
    );
  });

  readonly slideWidthPercent = computed(() => 100 / this.totalPages());

  readonly trackOffsetPercent = computed(
    () => -(this.currentPage() * 100) / this.totalPages(),
  );

  readonly canGoPrev = computed(() => this.totalPages() > 1);
  readonly canGoNext = computed(() => this.totalPages() > 1);

  constructor() {
    afterNextRender(
      () => {
        if (!isPlatformBrowser(this.platformId)) {
          this.videosPerPage.set(DESKTOP_VIDEOS_PER_PAGE);
          return;
        }

        this.tabletMediaQuery = window.matchMedia(TABLET_MEDIA_QUERY);
        this.desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
        this.applyVideosPerPage();
        this.tabletMediaQuery.addEventListener('change', this.onBreakpointChange);
        this.desktopMediaQuery.addEventListener('change', this.onBreakpointChange);
        this.startAutoPlay();
        this.bindVideoPlayback();
      },
      { injector: this.injector },
    );
  }

  onTitleAnimationComplete(): void {
    queueMicrotask(() => this.subtitleTyped()?.play());
  }

  goToPage(index: number): void {
    const clamped = Math.min(Math.max(index, 0), this.totalPages() - 1);
    if (clamped === this.currentPage()) {
      return;
    }
    this.currentPage.set(clamped);
    this.restartAutoPlay();
  }

  previous(): void {
    const total = this.totalPages();
    if (total <= 1) {
      return;
    }
    this.goToPage((this.currentPage() - 1 + total) % total);
  }

  next(): void {
    const total = this.totalPages();
    if (total <= 1) {
      return;
    }
    this.goToPage((this.currentPage() + 1) % total);
  }

  onCarouselEnter(): void {
    this.autoPlayPaused = true;
    this.stopAutoPlay();
  }

  onCarouselLeave(): void {
    this.autoPlayPaused = false;
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.tabletMediaQuery?.removeEventListener('change', this.onBreakpointChange);
    this.desktopMediaQuery?.removeEventListener('change', this.onBreakpointChange);
    this.stopAutoPlay();
    if (isPlatformBrowser(this.platformId)) {
      this.pauseAllVideos();
    }
  }

  private bindVideoPlayback(): void {
    const players = this.videoPlayers;
    if (!players) {
      return;
    }

    players.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      queueMicrotask(() => this.playAllVideosTogether());
    });

    queueMicrotask(() => this.playAllVideosTogether());
  }

  private playAllVideosTogether(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const videos = this.getVideoElements();
    if (videos.length === 0) {
      return;
    }

    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek errors before metadata */
      }
    });

    const startPlayback = (): void => {
      void Promise.all(
        videos.map((video) =>
          video.play().catch(() => {
            /* autoplay puede bloquearse hasta interacción */
          }),
        ),
      );
    };

    const pending = videos.filter((video) => video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA);

    if (pending.length === 0) {
      startPlayback();
      return;
    }

    let remaining = pending.length;
    const onReady = (): void => {
      remaining -= 1;
      if (remaining <= 0) {
        startPlayback();
      }
    };

    pending.forEach((video) => {
      video.addEventListener('loadeddata', onReady, { once: true });
    });
  }

  private getVideoElements(): HTMLVideoElement[] {
    return (
      this.videoPlayers
        ?.map((ref) => ref.nativeElement)
        .filter((element): element is HTMLVideoElement => element instanceof HTMLVideoElement) ?? []
    );
  }

  private resolveVideosPerPage(): number {
    if (this.desktopMediaQuery?.matches) {
      return DESKTOP_VIDEOS_PER_PAGE;
    }
    if (this.tabletMediaQuery?.matches) {
      return TABLET_VIDEOS_PER_PAGE;
    }
    return MOBILE_VIDEOS_PER_PAGE;
  }

  private applyVideosPerPage(): void {
    const nextPerPage = this.resolveVideosPerPage();

    if (nextPerPage === this.videosPerPage()) {
      return;
    }

    this.videosPerPage.set(nextPerPage);

    const total = Math.max(1, Math.ceil(this.items().length / nextPerPage));
    if (this.currentPage() >= total) {
      this.currentPage.set(total - 1);
    }

    this.restartAutoPlay();
    queueMicrotask(() => this.playAllVideosTogether());
  }

  private autoAdvance(): void {
    if (this.totalPages() <= 1) {
      return;
    }
    const next = (this.currentPage() + 1) % this.totalPages();
    this.currentPage.set(next);
  }

  private startAutoPlay(): void {
    if (!isPlatformBrowser(this.platformId) || this.autoPlayPaused) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (this.totalPages() <= 1) {
      return;
    }

    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.autoAdvance(), this.autoPlayMs());
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer !== null) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private pauseAllVideos(): void {
    this.getVideoElements().forEach((video) => {
      video.pause();
    });
  }
}
