import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroChartBar, heroEnvelope, heroExclamationTriangle, heroHome, heroPrinter, heroShoppingBag } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { UserRole } from '../../../auth/models/user-role.enum';

@Component({
  selector: 'app-not-found-page',
  imports: [NgIcon, CommonModule],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  providers: [
    provideIcons({
      heroHome,
      heroArrowLeft,
      heroExclamationTriangle,
      heroShoppingBag,
      heroPrinter,
      heroEnvelope,
      heroChartBar
    })
  ],
})
export class NotFoundPageComponent {

  // Exponemos solo los valores necesarios
  userRoleUser = UserRole.ROLE_USER;
  userRoleAdmin = UserRole.ROLE_ADMIN;

  currentYear = new Date().getFullYear();

  private router = inject(Router);
  private authStateService = inject(AuthStateService);

  //signasl psra el estado del componente
  private _isLoading = signal<boolean>(false);

  //computed properties
  isLoading = this._isLoading.asReadonly();
  currentUser = this.authStateService.currentUser;
  userRole = this.authStateService.userRole;

  /**
     * Enlaces útiles basados en el rol del usuario
     */
  usefulLinks = signal([
    {
      name: 'Inicio',
      description: 'Volver a la página principal',
      icon: 'heroHome',
      route: '/',
      color: 'blue'
    },
    {
      name: 'Productos',
      description: 'Explorar nuestros productos de imprenta',
      icon: 'heroShoppingBag',
      route: '/products',
      color: 'green'
    },
    {
      name: 'Servicios',
      description: 'Conoce nuestros servicios de impresión',
      icon: 'heroPrinter',
      route: '/services',
      color: 'purple'
    },
    {
      name: 'Contacto',
      description: 'Comunícate con nuestro equipo',
      icon: 'heroEnvelope',
      route: '/contact',
      color: 'orange'
    },
    // {
    //   name: 'Dashboard',
    //   description: 'Dashboard de administración',
    //   icon: 'heroChartBar',
    //   route: '/dashboard',
    //   color: 'fuchsia'
    // }
  ]);


  //Navega a una ruta especifica
  navigateTo(route: string): void {
    this._isLoading.set(true);

    //Simular carga de navegacion
    setTimeout(() => {
      this.router.navigate([route]);
      this._isLoading.set(false);
    }, 300)
  }


  //regresa a la pagina anteriro
  goBack(): void {
    this._isLoading.set(true);

    window.history.back();

    //timeOut de fallaback en caso de que history.back() no funcione
    //si la navegacion se ejecuta antes del segundo ya no entrara al settimeout
    //tampodo es necesario settear a slaso el _isoloading porque se destruye
    //el componente
    setTimeout(() => {
      this._isLoading.set(false);
      this.router.navigate(['/']);
    }, 1000)
  }


  /**
  * Obtiene las clases CSS para los botones de enlaces
  */
  getLinkButtonClasses(color: string): string {
    const baseClasses = 'flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ';

    const colorClasses = {
      blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-blue-200',
      green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700 focus:ring-green-200',
      purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 focus:ring-purple-200',
      orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 focus:ring-orange-200',
      // fuchsia: 'border-fuchsia-200 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 focus:ring-fuchsia-200'
    };

    return baseClasses + (colorClasses[color as keyof typeof colorClasses] || colorClasses.blue);
  }

  //Obtiene las clases CSS para los iconos
  getIconClasses(color: string): string {
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      fuchsia: 'text-fuchsia-600'
    };
    return `w-8 h-8 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`;
  }
  /**
 * TrackBy function para optimización de rendimiento
 */
  trackByLinkName(index: number, link: any): string {
    return link.name;
  }

}
