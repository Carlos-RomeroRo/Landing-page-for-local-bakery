import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalType } from '../../services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isMenuOpen = signal(false);
  activeSection = signal('home');
  private observer: IntersectionObserver | null = null;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.setupSectionObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  openModal(type: ModalType) {
    this.modalService.openModal(type);
  }

  setupSectionObserver() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sections = ['home', 'nosotros', 'productos', 'contacto'];
    const observerOptions = {
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id') || 'home';
          this.activeSection.set(sectionId);
        }
      });
    }, observerOptions);

    sections.forEach(id => {
      const element = document.getElementById(id) ||
                     (id === 'home' ? document.querySelector('app-hero') : null);
      if (element) {
        if (!element.id && id === 'home') element.id = 'home';
        this.observer?.observe(element);
      }
    });
  }

  isActive(section: string): boolean {
    return this.activeSection() === section;
  }

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}