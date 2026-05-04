import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ModalService, ModalType } from '../../services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isMenuOpen = signal(false);
  activeSection = signal('home');
  private observer: IntersectionObserver | null = null;
  private routerSub?: Subscription;

  constructor(
    private modalService: ModalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.setupSectionObserver());
    this.setupSectionObserver();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.observer?.disconnect();
  }

  openModal(type: ModalType) {
    this.modalService.openModal(type);
  }

  private isProductosRoute(): boolean {
    const path = this.router.url.split('#')[0].split('?')[0];
    return path === '/productos';
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

    if (this.isProductosRoute()) {
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
    if (this.isProductosRoute()) {
      return section === 'productos';
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

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
