import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroArrowPath, heroFunnel, heroMagnifyingGlass, heroXMark } from '@ng-icons/heroicons/outline';
import { ProductManagerService } from '../../../products/services/product-manager.service';

@Component({
  selector: 'app-product-filters',
  imports: [NgIcon],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
  providers: [provideIcons({
    heroMagnifyingGlass,
    heroFunnel,
    heroXMark,
    heroArrowPath
  })]
})
export class ProductFiltersComponent {

  private productManagerService = inject(ProductManagerService);

  // Outputs para comunicación con el componente padre
  // filtersChanged = output<void>();
  filtersChanged = output<{ status: string; stock: string }>();

  // Señales locales para filtros
  searchTerm = this.productManagerService.searchTerm;
  selectedCategory = this.productManagerService.selectedCategory;
  statusFilter = signal<string>('');
  stockFilter = signal<string>('');

  // Categorías disponibles
  categories = computed(() => {
    return this.productManagerService.products()
      .reduce((acc, product) => {
        if (!acc.includes(product.category)) acc.push(product.category);
        return acc;
      }, [] as string[]);
  });

  /**
   * Determina si hay filtros activos
   */
  hasActiveFilters = signal<boolean>(false);

  constructor() {
    //Actualizar el estado de los filtros activos
    effect(() => {
      const search = this.searchTerm();
      const category = this.selectedCategory();
      const status = this.statusFilter();
      const stock = this.stockFilter();

      // Cada vez que alguna cambie, se ejecuta automáticamente
      this.updateActiveFilters();
    })
  }
  /**
   * Maneja cambios en la búsqueda
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.productManagerService.setSearchTerm(value);
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Maneja cambios en la categoría
   */
  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.productManagerService.setCategoryFilter(value);
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Maneja cambios en el estado
   */
  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    // this.filtersChanged.emit();
    this.emitFilters();

  }

  /**
   * Maneja cambios en el stock
   */
  onStockChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.stockFilter.set(value);
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.productManagerService.setSearchTerm('');
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Limpia la categoría
   */
  clearCategory(): void {
    this.productManagerService.setCategoryFilter('');
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Limpia el estado
   */
  clearStatus(): void {
    this.statusFilter.set('');
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Limpia el stock
   */
  clearStock(): void {
    this.stockFilter.set('');
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters(): void {
    this.productManagerService.clearFilters();
    this.statusFilter.set('');
    this.stockFilter.set('');
    // this.filtersChanged.emit();
    this.emitFilters();
  }

  /**
   * Formatea el nombre de la categoría para mostrar
   */
  formatCategoryName(category: string): string {
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  private emitFilters(): void {
    this.filtersChanged.emit({
      status: this.statusFilter(),
      stock: this.stockFilter()
    });
  }
  /**
   * Actualiza el estado de filtros activos
   */
  private updateActiveFilters(): void {
    const hasFilters =
      this.searchTerm().length > 0 ||
      this.selectedCategory().length > 0 ||
      this.statusFilter().length > 0 ||
      this.stockFilter().length > 0;

    this.hasActiveFilters.set(hasFilters);
  }
}
