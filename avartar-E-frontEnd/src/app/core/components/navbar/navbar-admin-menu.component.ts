import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChartBar, heroCog6Tooth, heroCube, heroDocumentText, heroMapPin, heroShoppingBag, heroUsers } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-navbar-admin-menu',
  imports: [RouterLink, NgIcon],
  templateUrl: './navbar-admin-menu.component.html',
  // styleUrl: './navbar-admin-menu.component.css',
  providers: [
    provideIcons({
      heroChartBar,
      heroUsers,
      heroCog6Tooth,
      heroDocumentText,
      heroShoppingBag,
      heroCube,
      heroMapPin
    })
  ]
})
export class NavbarAdminMenuComponent {
  private router = inject(Router);

  // Signals para menus desplegables
  isManagementMenuOpen = signal<boolean>(false);
  isReportsMenuOpen = signal<boolean>(false);

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeAllMenus();
  }

  /**
   * Alterna el menú de gestión
   */
  toggleManagementMenu(): void {
    this.isManagementMenuOpen.update(value => !value);
    this.isReportsMenuOpen.set(false);
  }

  /**
   * Alterna el menú de reportes
   */
  toggleReportsMenu(): void {
    this.isReportsMenuOpen.update(value => !value);
    this.isManagementMenuOpen.set(false);
  }

  /**
   * Cierra todos los menus
   */
  closeAllMenus(): void {
    this.isManagementMenuOpen.set(false);
    this.isReportsMenuOpen.set(false);
  }

  /**
   * Obtiene las clases para los items del menú
   */
  getNavItemClasses(isActive: boolean = false): string {
    const baseClasses = 'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200';

    if (isActive) {
      return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
    }

    return `${baseClasses} text-gray-700 hover:text-gray-900 hover:bg-gray-100`;
  }

}
