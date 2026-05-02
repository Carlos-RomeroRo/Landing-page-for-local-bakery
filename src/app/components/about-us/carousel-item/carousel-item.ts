import { Component, Input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalType } from '../../../services/modal.service';

export interface CarouselItem {
  image: string;
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-item.html',
  styleUrl: './carousel-item.css'
})
export class Carousel implements OnInit, OnDestroy {
  @Input() items: CarouselItem[] = [];
  activeIndex = signal(0);
  private observers: IntersectionObserver[] = [];

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined') {
      setTimeout(() => this.setupIntersectionObserver(), 100);
    }
  }

  setupIntersectionObserver() {
    const sections = document.querySelectorAll('.carousel-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          this.activeIndex.set(index);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });

    sections.forEach(section => observer.observe(section));
    this.observers.push(observer);
  }

  ngOnDestroy() {
    this.observers.forEach(obs => obs.disconnect());
  }

  setActive(index: number) {
    this.activeIndex.set(index);
    if (typeof document === 'undefined') return;

    const section = document.querySelector(`[data-index="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  openModal(modalType: ModalType) {
    this.modalService.openModal(modalType);
  }
}