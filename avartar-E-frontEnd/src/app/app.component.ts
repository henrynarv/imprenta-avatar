import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroShoppingCartSolid, heroXMarkSolid } from '@ng-icons/heroicons/solid';
import { heroUsers, heroShoppingBag, heroBars3, heroXMark } from '@ng-icons/heroicons/outline';
import { CommonModule } from '@angular/common';
import { OrderReportComponent } from "./features/reports/pages/order-report/order-report.component";
import { ColorChipComponent } from "./features/color-chip/color-chip.component";
import { ProductListPageComponent } from "./features/products/page/product-list-page/product-list-page.component";
import { NavbarComponent } from "./core/components/navbar/navbar.component";
import { FooterComponent } from "./core/components/footer/footer.component";
import { simpleFacebook, simpleInstagram, simpleWhatsapp, simpleYoutube } from '@ng-icons/simple-icons';
import { LoginComponent } from "./features/auth/pages/login/login.component";
import { RegisterComponent } from "./features/auth/pages/register/register.component";
import { ForgotPasswordComponent } from "./features/auth/pages/forgot-password/forgot-password.component";
import { AlertContainerComponent } from "./shared/components/alert-container/alert-container.component";
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog.component";
import { PruebaListProductComponent } from "./features/prueba-list-product/prueba-list-product.component";
import { OrderDetailModalComponent } from "./features/reports/components/order-detail-modal/order-detail-modal.component";
import { ProductCardComponent } from './shared/components/product-card/product-card.component';
import { Product } from './features/products/models/product.interface';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { AuthService } from './features/auth/services/auth.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { APP_ASSETS } from './shared/constants/assets';





@Component({
  selector: 'app-root',
  imports: [NgIcon, CommonModule, OrderReportComponent, ColorChipComponent, ProductListPageComponent, NavbarComponent, FooterComponent, LoginComponent, RegisterComponent, ForgotPasswordComponent, AlertContainerComponent, ConfirmDialogComponent, PruebaListProductComponent, OrderReportComponent, OrderDetailModalComponent, ProductCardComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideIcons({ heroShoppingCartSolid, heroUsers, heroShoppingBag, heroBars3, heroXMark, simpleFacebook, simpleInstagram, simpleWhatsapp, simpleYoutube })],
})
export class AppComponent {

  logoGray = APP_ASSETS.LOGO_GRAY;
  logoWhite = APP_ASSETS.LOGO_WHITE;



  // Inyeccion de servicios
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();


  //signals para estado del compoente
  private _isNavigationLoading = signal<boolean>(false);
  private _currentYear = signal<number>(new Date().getFullYear());



  //computed properties de loaading para navegacion
  isNavigationLoading = computed(() => this._isNavigationLoading());
  currentYear = computed(() => this._currentYear());
  isLoading = computed(() => this.loadingService.isLoading());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    //configura el interceptor de laoding para navegacion
    this.setupNavigationLoading();

    //verifica autenticacon final
    this.checkInitialAuth();

  }


  /**
 * Configura el interceptor de loading para navegación entre rutas
 * Muestra loading durante la transición entre páginas
 */
  private setupNavigationLoading(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this._isNavigationLoading.set(true);
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // setTimeout(() => {
          this._isNavigationLoading.set(false);
          // }, 100);
        }
      })
  }

  //veridfca la autencitacion al iniciar la aplicacion
  private checkInitialAuth(): void {
    // El AuthService ya verifica el estado al inicializarse
    // Aquí podríamos realizar acciones adicionales si es necesario
    console.log('Estado de autenticación inicial:', this.isAuthenticated());
  }

  // Obtiene las clases Css para el conenido principal
  //aplica efectos visiales cuando hay loading
  getMainClasses(): string {
    const baseClasses = 'flex-grow transition-opacity duration-300';
    if (this.isNavigationLoading() || this.isLoading()) {
      return `${baseClasses} opacity-70 pointer-events-none`;
    }
    return baseClasses;
  }

  //  Obtiene las clases CSS para el loading overlay
  getLoadingOverlayClasses(): string {
    const baseClasses = 'fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300';

    if (this.isNavigationLoading() || this.isLoading()) {
      return `${baseClasses} opacity-100  bg-white bg-opacity-90`;
    }
    return `${baseClasses} opacity-0 pointer-events-none`;
  }

  /**
  * Maneja el evento de click en el contenido durante loading
  * Previene interacciones no deseadas
  */
  onContentClick(event: Event): void {
    if (this.isNavigationLoading() || this.isLoading()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }



  /**
 * TrackBy function para optimización
 */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Limpia las subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  /*
    isMenuOpen = signal<boolean>(false);
    isMegaMenuOpen = signal<boolean>(false);
    isMegaMenuOpenWomen = signal<boolean>(false);


    toggleMenu() {
      this.isMenuOpen.set(!this.isMenuOpen());

      if (this.isMenuOpen()) {
        document.body.classList.add('body-lock');//bloquea scrool de body
      } else {
        document.body.classList.remove('body-lock');
      }

    }
    scrollY = 0;

    // CAMBIO: handlers separados para Men
    openMegaMenu() {
      this.isMegaMenuOpen.set(true);
      this.isMegaMenuOpenWomen.set(false); // cerrar Women si está abierto
    }
    closeMegaMenu() {
      this.isMegaMenuOpen.set(false);
    }

    // CAMBIO: handlers separados para Women
    openMegaMenuWomen() {
      this.isMegaMenuOpenWomen.set(true);
      this.isMegaMenuOpen.set(false); // cerrar Men si está abierto
    }
    closeMegaMenuWomen() {
      this.isMegaMenuOpenWomen.set(false);
    }



    menus = [
      { name: 'Men', items: ['Tops', 'Dresses', 'Pants', 'Sweaters', 'T-Shirts', 'Jackets'] },
      { name: 'Women', items: ['Sarees', 'Lehenga Choli', 'Kurtas', 'Gowns'] },
    ];

    brands = ['Full Nelson', 'My Way', 'Re-Arranged', 'Counterfeit', 'Significant Other'];

    accessories = ['Watches', 'Wallets', 'Bags', 'Sunglasses', 'Hats', 'Belts'];

    productMock: Product = {
      id: 1,
      name: 'Tarjetas de Presentación',
      description: 'Diseño de prueba',
      price: 29990,
      originalPrice: 34990,
      category: 'tarjetas-de-presentacion',
      images: ['/images/tarjeta.jpg', '/images/volante.jpg', '/images/bro.jpg'],
      specifications: {
        paperType: 'Couché 300g',
        size: 'A6',
        color: 'Full color',
        finish: 'Mate'
      },
      stock: 10,
      isActive: true,
      isFeatured: false,
      tags: ['nuevo', 'promo'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      rating: 4.5,
      reviewCount: 10,
      deliveryTime: '3 días hábiles',
      minimumOrder: 50
    };
  */

}


