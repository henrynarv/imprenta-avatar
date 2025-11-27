import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { Product, ProductFilters } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {

  private router = inject(Router);

  // Inputs para configuración flexible
  products = input.required<Product[]>();
  loading = input<boolean>(false);
  emptyMessage = input<string>('No se encontraron productos');
  showFilters = input<boolean>(false);
  layout = input<'grid' | 'list'>('grid');

  // Outputs para comunicación con el componente padre
  productClicked = output<Product>();
  addToCartClicked = output<Product>();
  quickViewClicked = output<Product>();
  filtersChanged = output<ProductFilters>();

  // Inyección de servicios
  private productService = inject(ProductService);
  private alertService = inject(AlertService);
  private destroy$ = new Subject<void>();

  // Signals para filtros locales
  searchText = signal<string>('');
  selectedCategory = signal<string>('');
  priceRange = signal<{ min: number; max: number }>({ min: 0, max: 100000 });
  sortBy = signal<'name' | 'price' | 'rating' | 'newest'>('newest');
  sortOrder = signal<'asc' | 'desc'>('desc');
  inStockOnly = signal<boolean>(false);

  // Subject para debounce de búsqueda
  private searchSubject = new Subject<string>();

  // Computed properties
  gridClasses = computed(() => {
    return this.layout() === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      : 'grid grid-cols-1 gap-6';
  });

  constructor() {
    // Configurar debounce para búsqueda
    this.setupSearchDebounce();
  }

  /**
 * Configura el debounce para la búsqueda
 */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  /**
  * Maneja el cambio en el texto de búsqueda
  */
  onSearchTextChange(text: string): void {
    this.searchText.set(text);
    this.searchSubject.next(text);
  }

  /**
   * Maneja el cambio de categoría
   */
  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  /**
   * Maneja el cambio de ordenamiento
   */
  onSortChange(sortBy: 'name' | 'price' | 'rating' | 'newest'): void {
    this.sortBy.set(sortBy);
    this.applyFilters();
  }

  /**
   * Maneja el toggle de orden
   */
  onSortOrderToggle(): void {
    this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
    this.applyFilters();
  }

  /**
   * Maneja el toggle de stock
   */
  onStockToggle(): void {
    this.inStockOnly.update(value => !value);
    this.applyFilters();
  }

  /**
   * Aplica los filtros y emite el evento
   */
  applyFilters(): void {
    const filters: ProductFilters = {
      searchText: this.searchText() || undefined,
      category: this.selectedCategory() as any || undefined,
      minPrice: this.priceRange().min || undefined,
      maxPrice: this.priceRange().max || undefined,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      inStock: this.inStockOnly() || undefined
    };

    this.filtersChanged.emit(filters);
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchText.set('');
    this.selectedCategory.set('');
    this.priceRange.set({ min: 0, max: 100000 });
    this.sortBy.set('newest');
    this.sortOrder.set('desc');
    this.inStockOnly.set(false);
    this.applyFilters();


    //Emitir filtros completamenbte vacios al padre
    const emptyFilters: ProductFilters = {
      searchText: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'newest',
      sortOrder: 'desc',
      inStock: false
    };

    console.log('🔄 Enviando filtros vacíos al padre:', emptyFilters);
    this.filtersChanged.emit(emptyFilters);
  }


  //limpia el input de busqueda en el DOM
  private clearSearchInput(): void {
    setTimeout(() => {
      const searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.value = '';
        console.log('✅ Input de búsqueda limpiado en el DOM');
      }
    }, 0);
  }

  /**
   * Maneja el click en un producto
   */
  onProductSelected(product: Product): void {
    const path = ['/products', String(product.id)];

    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        this.router.navigate(path);
      });
    } else {
      this.router.navigate(path);
    }
  }
  /**
   * Maneja el agregar al carrito
   */
  onAddToCart(product: Product): void {
    this.addToCartClicked.emit(product);
  }

  /**
   * Maneja la vista rápida
   */
  onQuickView(product: Product): void {
    this.quickViewClicked.emit(product);
  }

  /**
   * Obtiene las categorías para el filtro
   */
  getCategories(): string[] {
    return this.productService.getCategories();
  }

  /**
   * Formatea el nombre de la categoría para mostrar
   */
  formatCategoryName(category: string): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * TrackBy function para optimizar rendimiento
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /*
  products = signal<Products[]>([
    {
      id: 1,
      name: 'Impresión de tarjetas',
      description: 'Tarjetas personales a todo color con acabado premium.',
      price: 25.5,
      image: 'images/tarjeta.jpg',
      stock: 12,
      rating: 5,
    },
    {
      id: 2,
      name: 'Volantes publicitarios',
      description: 'Volantes A5 para promoción de eventos y productos.',
      price: 15,
      image: 'images/volante.jpg',
      stock: 0,
      rating: 4,
    },
    {
      id: 3,
      name: 'Brochure corporativo',
      description: 'Brochures A4 con diseño elegante para empresas.',
      price: 45,
      image: 'images/bro.jpg',
      stock: 7,
      rating: 5,
    },
  ])
  */

}
