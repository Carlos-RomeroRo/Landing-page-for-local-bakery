import { Component, Input, signal, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface CarouselItem {
  image: string;
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carousel-item.html',
  styleUrl: './carousel-item.css',
})
export class Carousel implements OnInit, AfterViewInit, OnDestroy {
  @Input() items: CarouselItem[] = [];
  activeIndex = signal(0);
  private observers: IntersectionObserver[] = [];

  ngOnInit() {
    this.activeIndex.set(0);
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined') {
      setTimeout(() => this.setupIntersectionObserver(), 100);
    }
  }

  setupIntersectionObserver() {
    const sections = document.querySelectorAll('.carousel-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            this.activeIndex.set(index);
          }
        });
      },
      {
        threshold: [0.6],
        rootMargin: '0px 0px -20% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));
    this.observers.push(observer);
  }

  ngOnDestroy() {
    this.observers.forEach((obs) => obs.disconnect());
  }

  setActive(index: number) {
    this.activeIndex.set(index);
    if (typeof document === 'undefined') return;

    const section = document.querySelector(`[data-index="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
