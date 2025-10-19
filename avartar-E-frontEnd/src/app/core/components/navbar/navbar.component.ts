import { Component, computed, inject, signal } from '@angular/core';

import { heroArrowRightOnRectangle, heroBars3, heroChevronDown, heroCog6Tooth, heroUser } from '@ng-icons/heroicons/outline';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { NavbarUserMenuComponent } from "./navbar-user-menu.component";

import { heroShoppingCartSolid } from '@ng-icons/heroicons/solid';
import { CommonModule } from '@angular/common';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { CartBadgeComponent } from "../../../shared/components/cart-badge/cart-badge.component";
import { APP_ASSETS } from '../../../shared/constants/assets';
import { AlertService } from '../../../shared/service/alert.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, filter, map, Subject, take, takeUntil } from 'rxjs';
import { NavbarAdminMenuComponent } from './navbar-admin-menu.component';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [NgIcon, NavbarUserMenuComponent, NavbarAdminMenuComponent, CommonModule, CartBadgeComponent, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  providers: [provideIcons({
    heroBars3, heroShoppingCartSolid, heroXMark,
    heroChevronDown,
    heroUser,
    heroCog6Tooth,
    heroArrowRightOnRectangle
  })]
})
export class NavbarComponent {

  //assets
  readonly logoUrlGray = APP_ASSETS.LOGO_GRAY;
  readonly logoUrlColor = APP_ASSETS.LOGO_COLOR;

  //injeccionde sevcicios
  private authService = inject(AuthService);
  private alertService = inject(AlertService)
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  //Signal para el estado del componente
  isMenuOpen = signal<boolean>(false);
  isHoveredLogo = signal<boolean>(false);
  isUserDropdownOpen = signal<boolean>(false);
  currentRoute = signal<string>('/');

  // Computed properties del servicio de autenticación
  role = computed(() => this.authService.userRole());
  user = computed(() => this.authService.user());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  //compured logo dinamico basado en hover
  currentLogo = computed(() => {
    return this.isHoveredLogo() ? this.logoUrlColor : this.logoUrlGray
  })


  // Método para obtener el nombre completo (ya que tu User no tiene fullName)
  userFullName = computed(() => {
    const user = this.user();
    return user ? `${user.name} ${user.lastName}` : '';
  });

  // Método para obtener las iniciales del avatar
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return '';
    return `${user.name?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  });

  //Configura el listener de cambios de ruta
  private setupRouteListener(): void {
    this.router.events
      .pipe(
        // type guard: ahora TypeScript entiende que `event` es NavigationEnd
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        // mapeamos a la URL final (urlAfterRedirects es preferible si hay redirects)
        map((event: NavigationEnd) => event.urlAfterRedirects ?? event.url),
        // evita valores repetidos consecutivos
        distinctUntilChanged(),
        // cancela cuando destroy$ emita (ngOnDestroy)
        takeUntil(this.destroy$)
      )
      .subscribe(url => {
        // url es string ya tipado
        this.currentRoute.set(url);
        this.closeMobileMenu();
        this.closeUserDropdown();
      });
  }

  //alterna el menu movil
  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  //cierra el menu movil
  closeMobileMenu() {
    this.isMenuOpen.set(false);
  }



  //Alterna el dropdown del usuario
  toggleUserDropdown() {
    this.isUserDropdownOpen.update(value => !value);
  }

  //cierra el dropdown del usuario
  closeUserDropdown() {
    this.isUserDropdownOpen.set(false);
  }

  //cambia entre roles (solo para demo)
  switchRole() {
    const newRole = this.role() === 'user' ? 'admin' : 'user'
    this.authService.switchRole(newRole);

    this.alertService.success(
      `Rol cambiado`,
      `Ahora estas navegando como ${newRole === 'user' ? 'Usuario' : 'Administrador'}`

    );
  }

  //manea el logout del usuario
  async logout(): Promise<void> {



    const confirmed = await this.alertService.confirm({
      title: 'Cerrar sesión',
      message: 'Estas seguro de cerrar sesion?',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      icon: 'heroArrowRightOnRectangle'
    });
    if (confirmed) {
      this.authService.logout();
      this.alertService.success(
        'Sesion cerrada',
        'Has cerrado sesión correctamente'
      )
    }
  }
  //Navega al perfil del usuario
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeUserDropdown();
  }

  //navega  ala configuracion
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeUserDropdown();
  }

  //navega al incio
  navigateToHome(): void {
    this.router.navigate(['/']);
    this.closeMobileMenu()
  }


  //obtiene las clases para el item de usuario
  getUserItemClasses(): string {
    const baseClasses = 'flex items-center space-x-2 px-3  rounded-lg transition-all duration-200';
    return this.isUserDropdownOpen()
      ? `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200 ${baseClasses}`
      : `${baseClasses} hover:bg-gray-100 hover:text-blue-700`;
  }



  //TrackBy function para optimización
  trackByIndex(index: number): number {
    return index;
  }


  //Limpia las subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  /*
  private authService = inject(AuthService);
  currentLogo = signal<string>('/images/logo-ava.png');

  isMenuOpen = signal(false); //menu movil abierto ocerrado
  role = computed(() => this.authService.userRole())
  user = computed(() => this.authService.user());

  isHoveredLogo = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  switchRole() {
    this.authService.switchRole(this.role() === 'client' ? 'admin' : 'client')
  }

  getLogo(): string {
    return this.isHoveredLogo() ? this.logoUrl_color : this.logoUrl_gray;
  }

  */
}
