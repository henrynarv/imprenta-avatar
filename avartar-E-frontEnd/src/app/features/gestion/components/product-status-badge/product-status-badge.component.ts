import { Component, input } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroCheckCircle, heroExclamationTriangle, heroStar, heroXCircle } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-product-status-badge',
  imports: [NgIcon],
  templateUrl: './product-status-badge.component.html',
  styleUrl: './product-status-badge.component.scss',
  providers: [provideIcons({
    heroCheckCircle,
    heroXCircle,
    heroExclamationTriangle,
    heroStar
  })]
})
export class ProductStatusBadgeComponent {
  //inputs para configuración flexible
  type = input<'status' | 'stock' | 'featured'>('status');
  status = input<boolean>(true);
  stock = input<number>(0);
  featured = input<boolean>(false);

  // clases CSS para estado del product(activo/inactivo)
  getStatusClasses(): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    return this.status()
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  }

  //icono para el estado del producto
  getStatusIcon(): string {
    return this.status() ? 'heroCheckCircle' : 'heroXCircle';
  }

  //texto para el estado del producto
  getStatusText(): string {
    return this.status() ? 'Activo' : 'Inactivo';
  }

  //clases CSS para el estado de stock
  getStockClasses(): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const stock = this.stock();

    if (stock === 0) {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else if (stock < 10) {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    } else {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
  }

  // Icono para el estaddo del srock
  getStockIcon(): string {
    const stock = this.stock();
    if (stock === 0) return 'heroXCircle';
    if (stock < 10) return 'heroExclamationTriangle';
    return 'heroCheckCircle';
  }

  // Texto para el estado de stock
  getStockText(): string {
    const stock = this.stock();

    if (stock === 0) return 'Agotado';
    if (stock < 10) return `Stock bajo (${stock})`;
    return `En stock (${stock})`;
  }

  // Clases para producto destacado
  getFeaturedClasses(): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    return `${baseClasses} bg-purple-100 text-purple-800`;
  }
}
