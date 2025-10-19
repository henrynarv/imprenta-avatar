import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { ProductService } from '../../services/product.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product, ProductFilters, ProductResponse } from '../../models/product.interface';

@Component({
  selector: 'app-product-list-page',
  imports: [CommonModule, ProductListComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss'
})
export class ProductListPageComponent {
  // Inyección de servicios
  private productService = inject(ProductService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals para estado de la página
  private _products = signal<Product[]>([]);
  private _loading = signal<boolean>(true);
  private _filters = signal<ProductFilters>({});
  private _pagination = signal({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 12
  });

  // Computed properties
  products = computed(() => this._products());
  loading = computed(() => this._loading());
  pagination = computed(() => this._pagination());
  hasProducts = computed(() => this._products().length > 0);

  // Computed: Información de visualización
  displayInfo = computed(() => {
    const pagination = this._pagination();
    const startItem = pagination.currentPage * pagination.pageSize + 1;
    const endItem = Math.min(
      (pagination.currentPage + 1) * pagination.pageSize,
      pagination.totalElements
    );

    return {
      startItem,
      endItem,
      totalItems: pagination.totalElements,
      hasResults: pagination.totalElements > 0
    };
  });

  constructor() {
    // Cargar productos iniciales
    this.loadProducts();
  }

  /**
   * Inicialización del componente
   */
  ngOnInit(): void {
    // Suscribirse a cambios en los parámetros de la ruta
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.handleRouteParams(params);
      });
  }

  /**
   * Maneja los parámetros de la ruta
   */
  private handleRouteParams(params: any): void {
    const filters: ProductFilters = {};

    if (params.category) {
      filters.category = params.category;
    }

    if (params.search) {
      filters.searchText = params.search;
    }

    if (params.sort) {
      filters.sortBy = params.sort as any;
    }

    this._filters.set(filters);
    this.loadProducts(0);
  }

  /**
   * Carga los productos desde el servicio
   */
  loadProducts(page: number = 0): void {
    this._loading.set(true);

    this.productService.getProducts(
      page,
      this._pagination().pageSize,
      this._filters()
    ).subscribe({
      next: (response: ProductResponse) => {
        this._products.set(response.content);
        this._pagination.set({
          currentPage: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          pageSize: response.size
        });
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this._loading.set(false);
        this.alertService.error(
          'Error',
          'No se pudieron cargar los productos. Intenta nuevamente.'
        );
      }
    });
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.pagination().totalPages) {
      this.loadProducts(newPage);

      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Maneja el cambio de filtros
   */
  onFiltersChange(filters: ProductFilters): void {
    this._filters.set(filters);
    this.loadProducts(0);

    // Actualizar la URL con los filtros
    this.updateUrlWithFilters(filters);
  }

  /**
   * Actualiza la URL con los filtros actuales
   */
  private updateUrlWithFilters(filters: ProductFilters): void {
    const queryParams: any = {};

    if (filters.category) {
      queryParams.category = filters.category;
    }

    if (filters.searchText) {
      queryParams.search = filters.searchText;
    }

    if (filters.sortBy) {
      queryParams.sort = filters.sortBy;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Maneja el click en un producto
   */
  onProductClick(product: Product): void {
    // La navegación se maneja en el product-card
    console.log('Product clicked:', product.name);
  }

  /**
   * Maneja el agregar al carrito
   */
  onAddToCart(product: Product): void {
    // La acción se maneja en el product-card
    console.log('Add to cart:', product.name);
  }

  /**
   * Maneja la vista rápida
   */
  onQuickView(product: Product): void {
    this.alertService.info(
      'Vista Rápida',
      `Funcionalidad de vista rápida para: ${product.name}`
    );
    // Aquí podrías abrir un modal de vista rápida
  }

  /**
   * Obtiene el mensaje para cuando no hay productos
   */
  getEmptyMessage(): string {
    const filters = this._filters();

    if (filters.searchText) {
      return `No se encontraron productos para "${filters.searchText}". Intenta con otros términos.`;
    }

    if (filters.category) {
      return `No hay productos disponibles en la categoría seleccionada.`;
    }

    return 'No se encontraron productos que coincidan con los filtros aplicados.';
  }

  /**
   * Genera un array de números para la paginación
   */
  getPageNumbers(): number[] {
    const { currentPage, totalPages } = this.pagination();
    const pages: number[] = [];

    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
