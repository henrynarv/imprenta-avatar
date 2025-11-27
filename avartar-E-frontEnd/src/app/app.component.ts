import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroShoppingCartSolid } from '@ng-icons/heroicons/solid';
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

import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';

import { filter, Subject, takeUntil } from 'rxjs';
import { APP_ASSETS } from './shared/constants/assets';
import { AuthStateService } from './features/auth/services/auth-state.service';






@Component({
  selector: 'app-root',
  imports: [NgIcon, CommonModule, NavbarComponent, FooterComponent, AlertContainerComponent, ConfirmDialogComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideIcons({ heroShoppingCartSolid, heroUsers, heroShoppingBag, heroBars3, heroXMark, simpleFacebook, simpleInstagram, simpleWhatsapp, simpleYoutube })],
})
export class AppComponent {

  logoGray = APP_ASSETS.LOGO_GRAY;
  logoWhite = APP_ASSETS.LOGO_WHITE;

  private navigationTimer: any;
  private navigationLoadingActive = false; // ← NUEVO: Trackear estado
  logoPreloaded = signal<boolean>(false);

  // Inyeccion de servicios
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private authState = inject(AuthStateService);
  private destroy$ = new Subject<void>();

  isLoading = computed(() => this.loadingService.isLoading());
  role = computed(() => this.authState.userRole());
  isAuthenticated = computed(() => this.authState.isAuthenticated());
  showFooter = computed(() => {
    //nadie logueado mostrar footer
    if (!this.isAuthenticated()) return true;

    //usuario logueado → mostrar solo si es ROLE_USER
    return this.role() === 'ROLE_USER'

  });

  constructor() {
    this.setupNavigationLoading();
  }

  ngOnInit() {
    this.preloadLogo();
  }

  private preloadLogo(): void {
    const img = new Image();
    img.src = this.logoWhite;

    // AGREGAR TIMEOUT DE SEGURIDAD
    const safetyTimeout = setTimeout(() => {
      this.logoPreloaded.set(true);
    }, 3000);

    img.onload = () => {
      clearTimeout(safetyTimeout);
      this.logoPreloaded.set(true);
      console.log('Logo precargado');
    };

    img.onerror = () => {
      clearTimeout(safetyTimeout);
      console.warn('Error al precargar logo');
      this.logoPreloaded.set(true);
    };
  }

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
          // LIMPIAR TIMER ANTERIOR POR SI ACASO
          if (this.navigationTimer) {
            clearTimeout(this.navigationTimer);
          }

          this.navigationTimer = setTimeout(() => {
            this.loadingService.show();
            this.navigationLoadingActive = true; // ← MARCAR COMO ACTIVO
          }, 150);
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          // LIMPIAR TIMER INMEDIATAMENTE
          if (this.navigationTimer) {
            clearTimeout(this.navigationTimer);
            this.navigationTimer = null;
          }

          //SOLO OCULTAR SI REALMENTE SE MOSTRÓ
          if (this.navigationLoadingActive) {
            this.loadingService.hide();
            this.navigationLoadingActive = false;
          }
        }
      });
  }

  ngOnDestroy(): void {
    //LIMPIAR TODO AL DESTRUIR
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
    }
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


