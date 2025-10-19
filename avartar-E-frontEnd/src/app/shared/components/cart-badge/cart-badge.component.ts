import { Component, computed, effect, inject, signal } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroShoppingCartSolid } from '@ng-icons/heroicons/solid';
import { ProductService } from '../../../features/products/services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-badge',
  imports: [NgIcon],
  templateUrl: './cart-badge.component.html',
  styleUrl: './cart-badge.component.scss',
  providers: [provideIcons({ heroShoppingCartSolid })]
})
export class CartBadgeComponent {


  // Inyección de servicios
  private productService = inject(ProductService);
  private router = inject(Router);



  // Signals del componente
  private _isBouncing = signal<boolean>(false);

  // computed propierties  del servicio
  cartItems = computed(() => this.productService.cartItems());
  cartItemCount = computed(() => this.productService.getCartItemCount());

  //commputed: determina so se muestra el badge
  showBadge = computed(() => this.cartItemCount() > 0);


  constructor() {
    // Efecto para animar el badge cuando se agregan productos
    effect(() => {
      const count = this.cartItemCount();
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
    const baseClasses = 'absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center font-bold transition-all duration-300';
    const bounceClass = this._isBouncing() ? 'animate-bounce-scale' : '';

    return `${baseClasses} ${bounceClass}`;
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
