import { isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { Producto } from '../../../models/producto.model';
import { ProductosService } from '../../../services/productos.service';
import {
  apiTipoToCategoryKey,
  CATEGORY_LABELS,
  CategoryKey,
  categoryKeyToApiTipo,
  DEFAULT_CATEGORY_OPTIONS,
} from '../../../utils/producto-categoria';
import { formatPrecio } from '../../../utils/format-precio';
import { CarritoPanelComponent } from '../carrito-panel/carrito-panel.component';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';

const PRODUCTOS_POR_PAGINA = 16;

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [ProductDetailModalComponent, CarritoPanelComponent],
  templateUrl: './product-search.html',
  styleUrl: './product-search.css',
  host: { class: 'flex min-h-0 w-full min-w-0 flex-1 flex-col' },
})
export class ProductSearch {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productosService = inject(ProductosService);
  private readonly productModal = viewChild.required(ProductDetailModalComponent);

  readonly categoryMenuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly selectedCategory = signal<CategoryKey>('all');
  readonly productosLoading = signal(isPlatformBrowser(this.platformId));
  readonly paginaActual = signal(1);

  readonly categoryOptions = toSignal(
    isPlatformBrowser(this.platformId)
      ? this.productosService.listarTipos().pipe(
          map((tipos) => [
            { key: 'all' as CategoryKey, label: CATEGORY_LABELS.all },
            ...tipos.map((tipo) => {
              const key = apiTipoToCategoryKey(tipo.id);
              return { key, label: CATEGORY_LABELS[key] };
            }),
          ]),
          catchError(() => of(DEFAULT_CATEGORY_OPTIONS)),
        )
      : of(DEFAULT_CATEGORY_OPTIONS),
    { initialValue: DEFAULT_CATEGORY_OPTIONS },
  );

  readonly selectedCategoryLabel = computed(() => CATEGORY_LABELS[this.selectedCategory()]);

  readonly productos = toSignal(
    isPlatformBrowser(this.platformId)
      ? toObservable(this.selectedCategory).pipe(
          switchMap((categoria) => {
            this.productosLoading.set(true);
            const apiTipo = categoryKeyToApiTipo(categoria);
            const fuente =
              apiTipo === null
                ? this.productosService.listar()
                : this.productosService.listarPorTipo(apiTipo);

            return fuente.pipe(
              tap(() => this.productosLoading.set(false)),
              catchError(() => {
                this.productosLoading.set(false);
                return of([] as Producto[]);
              }),
            );
          }),
        )
      : of([] as Producto[]).pipe(tap(() => this.productosLoading.set(false))),
    { initialValue: [] as Producto[] },
  );

  readonly productosFiltrados = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.productos();

    if (!query) {
      return items;
    }

    return items.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(query) ||
        producto.descripcion.toLowerCase().includes(query),
    );
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.productosFiltrados().length / PRODUCTOS_POR_PAGINA)),
  );

  readonly productosPaginados = computed(() => {
    const items = this.productosFiltrados();
    const pagina = Math.min(this.paginaActual(), this.totalPaginas());
    const inicio = (pagina - 1) * PRODUCTOS_POR_PAGINA;
    return items.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  });

  readonly paginasVisibles = computed(() => {
    const total = this.totalPaginas();
    const actual = Math.min(this.paginaActual(), total);
    const paginas: number[] = [];

    for (let pagina = actual - 2; pagina <= actual + 2; pagina += 1) {
      if (pagina >= 1 && pagina <= total) {
        paginas.push(pagina);
      }
    }

    return paginas.length ? paginas : [1];
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-category-dropdown-root]')) {
      this.categoryMenuOpen.set(false);
    }
  }

  toggleCategoryMenu(): void {
    this.categoryMenuOpen.update((open) => !open);
  }

  selectCategory(key: CategoryKey): void {
    this.selectedCategory.set(key);
    this.categoryMenuOpen.set(false);
    this.paginaActual.set(1);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.paginaActual.set(1);
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.paginaActual.set(1);
  }

  irAPagina(pagina: number): void {
    const destino = Math.min(Math.max(1, pagina), this.totalPaginas());
    this.paginaActual.set(destino);
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual() + 1);
  }

  openProduct(product: Producto): void {
    this.productModal().open(product);
  }

  formatPrecio(precio: number): string {
    return formatPrecio(precio);
  }
}
