import {
  afterNextRender,
  Component,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { ModalService, ModalType } from '../../../services/modal.service';

/** Rutas con página propia (no son fragmentos del home). */
type DedicatedNav = 'productos' | 'nosotros';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, DarkModeToggleComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isMenuOpen = signal(false);
  activeSection = signal('home');
  /** Sincronizado con la URL real (incl. tras hidratación del cliente). */
  private readonly dedicatedNav = signal<DedicatedNav | null>(null);

  private observer: IntersectionObserver | null = null;
  private routerSub?: Subscription;
  private readonly injector = inject(Injector);

  constructor(
    private modalService: ModalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.applyUrlToDedicatedNav(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isMenuOpen.set(false);
        this.applyUrlToDedicatedNav(e.urlAfterRedirects);
        this.setupSectionObserver();
      });

    this.setupSectionObserver();

    afterNextRender(
      () => {
        this.applyUrlToDedicatedNav(this.router.url);
        this.setupSectionObserver();
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.observer?.disconnect();
  }

  openModal(type: ModalType) {
    this.modalService.openModal(type);
  }

  private applyUrlToDedicatedNav(fullUrl: string): void {
    this.dedicatedNav.set(this.parseDedicatedNav(fullUrl));
  }

  private parseDedicatedNav(fullUrl: string): DedicatedNav | null {
    const tree = this.router.parseUrl(fullUrl);
    const primary = tree.root.children['primary'];
    const segments = primary?.segments.map((s) => s.path) ?? [];
    const first = segments[0];
    if (first === 'productos') {
      return 'productos';
    }
    if (first === 'nosotros') {
      return 'nosotros';
    }
    return null;
  }

  private routeNavSection(): string | null {
    return this.dedicatedNav();
  }

  private urlFragment(): string | null {
    const hash = this.router.url.split('#')[1];
    return hash ? decodeURIComponent(hash) : null;
  }

  setupSectionObserver() {
    this.observer?.disconnect();
    this.observer = null;

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (this.routeNavSection() !== null) {
      return;
    }

    const sections = ['home', 'nosotros', 'contacto'];
    const observerOptions = {
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id') || 'home';
          this.activeSection.set(sectionId);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const element =
        document.getElementById(id) || (id === 'home' ? document.querySelector('app-hero') : null);
      if (element) {
        if (!element.id && id === 'home') {
          element.id = 'home';
        }
        this.observer?.observe(element);
      }
    });
  }

  isActive(section: string): boolean {
    const routed = this.routeNavSection();
    if (routed !== null) {
      return section === routed;
    }

    const fragment = this.urlFragment();
    if (fragment) {
      return fragment === section;
    }

    return this.activeSection() === section;
  }

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }
}
