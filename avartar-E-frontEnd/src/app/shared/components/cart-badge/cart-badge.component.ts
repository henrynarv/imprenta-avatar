import { Component, computed, effect, inject, signal } from '@angular/core';

import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroShoppingCartSolid } from '@ng-icons/heroicons/solid';
import { ProductService } from '../../../features/products/services/product.service';
import { Router } from '@angular/router';
import { CartService } from '../../../features/cart/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-badge',
  imports: [NgIcon, CommonModule],
  templateUrl: './cart-badge.component.html',
  styleUrl: './cart-badge.component.scss',
  providers: [provideIcons({ heroShoppingCartSolid })]
})
export class CartBadgeComponent {
  // Inyección de servicios
  private cartService = inject(CartService);
  private router = inject(Router);



  // Signals del componente
  private _isBouncing = signal<boolean>(false);

  // computed propierties  del servicio
  totalItems = this.cartService.totalItems;
  total = this.cartService.total;

  //commputed: determina so se muestra el badge
  showBadge = computed(() => this.totalItems() > 0);


  constructor() {
    // Efecto para animar el badge cuando se agregan productos
    effect(() => {
      const count = this.totalItems();
      if (count > 0) {
        this.triggerBounceAnimation();
      }

    })
  }
  /**
   * Activa la animación de bounce del badge
   */
  private triggerBounceAnimation(): void {
    this._isBouncing.set(true);

    // Remover la animación después de que termine
    setTimeout(() => {
      this._isBouncing.set(false);
    }, 600);
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  /**
  * Obtiene las clases CSS para el contenedor
  */
  getContainerClasses(): string {
    const baseClasses = 'relative cursor-pointer p-2 rounded-lg transition-all duration-200';
    const hoverClasses = 'hover:bg-gray-100 hover:text-blue-600';

    return `${baseClasses} ${hoverClasses}`;
  }

  /**
   * Obtiene las clases CSS para el badge
   */
  getBadgeClasses(): string {
    //para usar badget dinamico eliminar bg-red-500
    const baseClasses = 'absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center font-bold transition-all duration-300';
    const bounceClass = this._isBouncing() ? 'animate-bounce-scale' : '';

    //color dinamico segun cantidad

    const colorClass = this.getBadgeColor();

    return `${baseClasses} ${bounceClass} ${colorClass}`;
  }


  //Obtine el color del badge segun cantidad
  private getBadgeColor(): string {
    const count = this.totalItems();
    if (count === 0) return 'hidden';
    if (count <= 3) return 'bg-green-500';
    if (count <= 6) return 'bg-blue-500';
    return 'bg-red-500';
  }


  /*

  private cartService = inject(CartService);

  // Signals modernos
  cartCount = this.cartService.count;
  shouldAnimate = signal(false);

  constructor() {
    // Efecto reactivo moderno
    effect(() => {
      const count = this.cartCount();

      if (count > 0) {
        this.triggerAnimation();
      }
    });
  }

  private triggerAnimation() {
    this.shouldAnimate.set(true);

    // Reset después de la animación
    setTimeout(() => this.shouldAnimate.set(false), 600);
  }
    */
}
