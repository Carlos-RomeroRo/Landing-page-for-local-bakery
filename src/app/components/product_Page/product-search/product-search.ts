import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type CategoryKey = 'all' | 'pan' | 'pasteles' | 'empanadas' | 'otros';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-search.html',
  styleUrl: './product-search.css',
  host: { class: 'flex min-h-0 w-full min-w-0 flex-1 flex-col' },
})
export class ProductSearch {
  /** Panel lateral móvil (encima del contenido) */
  readonly mobileSidebarOpen = signal(false);

  /** En desktop: panel lateral visible u oculto para dar más ancho al listado */
  readonly desktopSidebarCollapsed = signal(false);

  readonly categoryMenuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly selectedCategoryLabel = signal('Todas las categorías');

  private readonly categoryLabels: Record<CategoryKey, string> = {
    all: 'Todas las categorías',
    pan: 'Panes',
    pasteles: 'Pasteles',
    empanadas: 'Empanadas',
    otros: 'Otros',
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-category-dropdown-root]')) {
      this.categoryMenuOpen.set(false);
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((open) => !open);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  toggleDesktopSidebar(): void {
    this.desktopSidebarCollapsed.update((c) => !c);
  }

  toggleCategoryMenu(): void {
    this.categoryMenuOpen.update((o) => !o);
  }

  selectCategory(key: CategoryKey): void {
    this.selectedCategoryLabel.set(this.categoryLabels[key]);
    this.categoryMenuOpen.set(false);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }
}
