import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { ProductService } from '../../services/product.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { Product, ProductFilters, ProductResponse } from '../../models/product.interface';
import { ProductManagerService } from '../../services/product-manager.service';

@Component({
  selector: 'app-product-list-page',
  imports: [CommonModule, ProductListComponent],
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss'
})
export class ProductListPageComponent {
  // Inyección de servicios
  private productService = inject(ProductManagerService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Signals para estado de la página
  private _displayedProducts = signal<Product[]>([]);
  private _loading = signal<boolean>(true);
  private _filters = signal<ProductFilters>({});
  // private _pagination = signal({
  //   currentPage: 0,
  //   totalPages: 0,
  //   totalElements: 0,
  //   pageSize: 12
  // });

  // Computed properties
  displayedProducts = computed(() => this._displayedProducts());
  loading = computed(() => this._loading());
  // pagination = computed(() => this._pagination());
  hasProducts = computed(() => this._displayedProducts().length > 0);

  // Computed: Información de visualización
  // displayInfo = computed(() => {
  //   const pagination = this._pagination();
  //   const startItem = pagination.currentPage * pagination.pageSize + 1;
  //   const endItem = Math.min(
  //     (pagination.currentPage + 1) * pagination.pageSize,
  //     pagination.totalElements
  //   );

  //   return {
  //     startItem,
  //     endItem,
  //     totalItems: pagination.totalElements,
  //     hasResults: pagination.totalElements > 0
  //   };
  // });

  constructor() {
    // Cargar productos iniciales
    this.loadProducts();

    //efecto Para debuggear filtros
    effect(() => {
      const filters = this._filters();
      console.log('🔍 FILTROS ACTUALES en PADRE:', {
        searchText: filters.searchText,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        inStock: filters.inStock
      });
    })
  }

  /**
   * Inicialización del componente
   */
  ngOnInit(): void {
    // ✅ Limpiar filtros al recargar la página
    this._filters.set({});
    this.router.navigate([], {
      queryParams: {}, // limpia los parámetros de la URL
      replaceUrl: true // evita que se guarde en el historial
    });

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
    this.applyFilters();
  }

  /**
   * Carga los productos desde el servicio
   */
  loadProducts(page: number = 0): void {
    this._loading.set(true);


    //obtener todos los productos publicos
    const allPublicProducts = this.productService.publicProducts();

    //aplicar filtros inicales
    const filteredProducts = this.applyLocalFilters(allPublicProducts, this._filters());

    this._displayedProducts.set(filteredProducts);
    this._loading.set(false);

    console.log('📦 Productos cargados:', filteredProducts.length);
    console.log('🎲 Productos con 3D:', filteredProducts.filter(p => p.has3DModel).length);


    // this.productService.getProducts(
    //   page,
    //   this._pagination().pageSize,
    //   this._filters()
    // ).subscribe({
    //   next: (response: ProductResponse) => {
    //     this._displayedProducts.set(response.content);
    //     this._pagination.set({
    //       currentPage: response.number,
    //       totalPages: response.totalPages,
    //       totalElements: response.totalElements,
    //       pageSize: response.size
    //     });
    //     this._loading.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error loading products:', error);
    //     this._loading.set(false);
    //     this.alertService.error(
    //       'Error',
    //       'No se pudieron cargar los productos. Intenta nuevamente.'
    //     );
    //   }
    // });
  }


  // Aplica filtros localmente a los productos en memoria
  private applyLocalFilters(product: Product[], filters: ProductFilters): Product[] {
    let filtered = [...product];

    //filtro por categoria
    if (filters.category && filters.category.trim() !== '') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    //filtro por texto de busqueda
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por precio mínimo
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }

    // Filtro por precio máximo
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Filtro por stock
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Filtro por destacados
    if (filters.isFeatured) {
      filtered = filtered.filter(product => product.isFeatured);
    }

    return filtered;
  }

  private applyFilters(): void {
    const allPublicProducts = this.productService.publicProducts();
    const filteredProducts = this.applyLocalFilters(allPublicProducts, this._filters());

    this._displayedProducts.set(filteredProducts);
  }

  //Maneja el cambio de filtros desde componentes hijos
  onFiltersChange(filters: ProductFilters): void {
    console.log('FILTROS RECIBIDOS del HIJO:', filters);
    this._filters.set({ ...filters });
    this.applyFilters();

    //actualizar la URL de los filtros
    this.updateUrlWithFilters(filters);
  }


  /**
   * Actualiza la URL con los filtros actuales
   */
  private updateUrlWithFilters(filters: ProductFilters): void {
    const queryParams: any = {};

    if (filters.category && filters.category.trim() !== '') {
      queryParams.category = filters.category;
    } else {
      queryParams.category = null;
    }

    if (filters.searchText && filters.searchText.trim() !== '') {
      queryParams.search = filters.searchText;
    } else {
      queryParams.search = null;
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
    console.log('Tiene modelo 3D:', product.has3DModel);

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
  // getPageNumbers(): number[] {
  //   const { currentPage, totalPages } = this.pagination();
  //   const pages: number[] = [];

  //   const startPage = Math.max(0, currentPage - 2);
  //   const endPage = Math.min(totalPages - 1, currentPage + 2);

  //   for (let i = startPage; i <= endPage; i++) {
  //     pages.push(i);
  //   }

  //   return pages;
  // }

  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
