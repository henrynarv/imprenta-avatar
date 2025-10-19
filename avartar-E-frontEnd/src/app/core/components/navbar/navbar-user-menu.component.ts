import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroDocumentText, heroHome, heroPhone, heroQuestionMarkCircle, heroShoppingBag } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-navbar-user-menu',
  imports: [RouterLink, NgIcon],
  templateUrl: './navbar-user-menu.component.html',
  styleUrl: './navbar-user-menu.component.scss',
  providers: [
    provideIcons({
      heroHome,
      heroShoppingBag,
      heroDocumentText,
      heroQuestionMarkCircle,
      heroPhone
    })
  ]
})
export class NavbarUserMenuComponent {
  private router = inject(Router);

  // Signals para mega menus
  isProductsMenuOpen = signal<boolean>(false);
  isServicesMenuOpen = signal<boolean>(false);

  // Computed: Determina si algún mega menu está abierto
  isAnyMegaMenuOpen = computed(() =>
    this.isProductsMenuOpen() || this.isServicesMenuOpen()
  );

  // Datos para los mega menus
  productCategories = [
    {
      name: 'Tarjetas de Presentación',
      items: ['Premium', 'Económicas', 'Corporativas', 'Ecológicas']
    },
    {
      name: 'Volantes y Flyers',
      items: ['Full Color', 'Doble Cara', 'Económicos', 'Promocionales']
    },
    {
      name: 'Folletos y Catálogos',
      items: ['Corporativos', 'Productos', 'Institucionales', 'Plegables']
    },
    {
      name: 'Invitaciones',
      items: ['Bodas', 'Cumpleaños', 'Corporativas', 'Digitales']
    }
  ];

  serviceCategories = [
    {
      name: 'Impresión Digital',
      items: ['Rápida', 'Full Color', 'Blanco y Negro', 'Fotográfica']
    },
    {
      name: 'Diseño Gráfico',
      items: ['Logotipos', 'Branding', 'Material Publicitario', 'Social Media']
    },
    {
      name: 'Gran Formato',
      items: ['Lonas', 'Vinilos', 'Backlight', 'Roll Up']
    },
    {
      name: 'Servicios Especiales',
      items: ['Troquelado', 'Plastificado', 'Encuadernación', 'Grabado']
    }
  ];

  featuredProducts = [
    {
      image: '/assets/images/featured/tarjetas-premium.jpg',
      title: 'Tarjetas Premium',
      description: 'Calidad superior para tu imagen profesional',
      badge: 'Más Vendido'
    },
    {
      image: '/assets/images/featured/volantes-color.jpg',
      title: 'Volantes Full Color',
      description: 'Ideal para promociones y eventos',
      badge: 'Nuevo'
    }
  ];

  /**
   * Abre el mega menu de productos
   */
  openProductsMenu(): void {
    this.isProductsMenuOpen.set(true);
    this.isServicesMenuOpen.set(false);
  }

  /**
   * Cierra el mega menu de productos
   */
  closeProductsMenu(): void {
    this.isProductsMenuOpen.set(false);
  }

  /**
   * Abre el mega menu de servicios
   */
  openServicesMenu(): void {
    this.isServicesMenuOpen.set(true);
    this.isProductsMenuOpen.set(false);
  }

  /**
   * Cierra el mega menu de servicios
   */
  closeServicesMenu(): void {
    this.isServicesMenuOpen.set(false);
  }

  /**
   * Cierra todos los mega menus
   */
  closeAllMenus(): void {
    this.isProductsMenuOpen.set(false);
    this.isServicesMenuOpen.set(false);
  }

  /**
   * Navega a una categoría de productos
   */
  navigateToCategory(category: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: category.toLowerCase().replace(/\s+/g, '-') }
    });
    this.closeAllMenus();
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeAllMenus();
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

  /**
   * TrackBy functions para optimización
   */
  trackByCategoryName(index: number, category: any): string {
    return category.name;
  }

  trackByIndex(index: number): number {
    return index;
  }



  /*


  isMegaMenuOpen = signal<boolean>(false);
  isMegaMenuOpenWomen = signal<boolean>(false);

  openMegaMenu() {
    this.isMegaMenuOpen.set(true);
    this.isMegaMenuOpenWomen.set(false);
  }

  closeMegaMenu() {
    this.isMegaMenuOpen.set(false)
  }

  openMegaMenuWomen() {
    this.isMegaMenuOpenWomen.set(true);
    this.isMegaMenuOpen.set(false);
  }

  closeMegaMenuWomen() {
    this.isMegaMenuOpenWomen.set(false)
  }


  menus = [
    { name: 'Men', items: ['Tops', 'Dresses', 'Pants', 'Sweaters', 'T-Shirts', 'Jackets'] },
    { name: 'Women', items: ['Sarees', 'Lehenga Choli', 'Kurtas', 'Gowns'] },
  ];

  brands = ['Full Nelson', 'My Way', 'Re-Arranged', 'Counterfeit', 'Significant Other'];

  accessories = ['Watches', 'Wallets', 'Bags', 'Sunglasses', 'Hats', 'Belts'];

*/
}
