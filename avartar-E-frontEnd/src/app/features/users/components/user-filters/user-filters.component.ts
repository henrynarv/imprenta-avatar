import { Component, computed, ElementRef, HostListener, inject, input, output, signal, ViewChild } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { UserQueryParams } from '../../models/user-management.interface';
import { filter } from 'rxjs';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroCheckCircle, heroChevronDown, heroCog6Tooth, heroFunnel, heroNoSymbol, heroShieldCheck, heroTrash, heroUser } from '@ng-icons/heroicons/outline';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-filters',
  imports: [NgIcon, FormsModule],
  templateUrl: './user-filters.component.html',
  styleUrl: './user-filters.component.scss',
  providers: [
    provideIcons({
      heroCog6Tooth, heroChevronDown, heroCheckCircle, heroNoSymbol,
      heroShieldCheck, heroUser, heroTrash, heroFunnel
    })
  ]
})
export class UserFiltersComponent {

  private userManagementService = inject(UserManagementService)
  @ViewChild('dropdownContainer', { static: false }) dropdownContainer!: ElementRef;
  isDropdownOpen = signal<boolean>(false);

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  // Para cerrar el dropdown al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  //Inputs
  currentFilters = input.required<UserQueryParams>();
  loading = input<boolean>(false);
  selectedCount = input<number>(0);
  totalUsers = input<number>(0);

  //outputs
  filtersChanged = output<Partial<UserQueryParams>>();
  bulkAction = output<string>();

  //señales locales para los controles del formulario
  searchTerm = signal<string>('');
  selectedRole = signal<'ROLE_USER' | 'ROLE_ADMIN' | 'all'>('all');
  selectedStatus = signal<'active' | 'inactive' | 'all'>('all');
  selectedSort = signal<string>('createdAt-desc');


  //computed para el texto del resumen
  filterSummary = computed(() => {
    const filters = [];

    if (this.searchTerm()) {
      filters.push(`búsqueda: "${this.searchTerm()}"`);
    }

    if (this.selectedRole() !== 'all') {
      filters.push(`rol: "${this.selectedRole()}"`);
    }

    if (this.selectedStatus() !== 'all') {
      filters.push(`estado: "${this.selectedStatus()}"`);
    }

    return filters.length > 0 ? `Filtros: ${filters.join(', ')}` : 'Sin filtros activos';
  })


  //actualiza los filtros con los valores actuales

  ngOnInit(): void {
    const filters = this.currentFilters();
    const normalizedSearch = (filters.search || '').toString().trim().toLowerCase();
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';


    this.searchTerm.set(normalizedSearch);
    this.selectedRole.set(filters.role || 'all');
    this.selectedStatus.set(filters.status || 'all');
    // this.selectedSort.set(`${filters.sortBy}-${filters.sortOrder}`);
    this.selectedSort.set(`${sortBy}-${sortOrder}`);
  }

  //Aplica los filtros actuales
  applyFilters(): void {
    const [sortBy, sortOrder] = this.selectedSort().split('-');

    const newFilters: Partial<UserQueryParams> = {
      search: this.searchTerm().trim().toLowerCase() || undefined,
      role: this.selectedRole() !== 'all' ? this.selectedRole() : undefined,
      status: this.selectedStatus() !== 'all' ? this.selectedStatus() : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: 1,// Resetear a primera página al aplicar nuevos filtros
    };
    this.filtersChanged.emit(newFilters)

  }

  //Limpia todos ls filtros
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRole.set('all');
    this.selectedStatus.set('all');
    this.selectedSort.set('createdAt-desc');


    this.filtersChanged.emit({
      search: undefined,
      role: undefined,
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    })
  }

  //maneja la acción masiva seleccionada
  onBulkAction(action: string): void {
    if (this.selectedCount() === 0) {
      return;
    }
    this.bulkAction.emit(action);
  }

  //verifica si hay filtros activos
  hasActiveFilters(): boolean {
    return !!this.searchTerm() ||
      this.selectedRole() !== 'all' ||
      this.selectedStatus() !== 'all'
  }

  //manjea la tecla enter en la búsqueda
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }
}



