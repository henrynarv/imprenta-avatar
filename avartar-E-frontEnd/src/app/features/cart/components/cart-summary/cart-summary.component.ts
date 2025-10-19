import { Component, computed, inject, input, output, signal } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroArrowLeft, heroShoppingCart, heroTrash, heroTruck } from '@ng-icons/heroicons/outline';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/service/alert.service';
import { CartSummary, ShippingOption } from '../../models/cart.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  imports: [CommonModule, NgIcon],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
  providers: [provideIcons({ heroShoppingCart, heroArrowLeft, heroTrash, heroTruck })]
})
export class CartSummaryComponent {

  //inputs del componente padre
  summary = input.required<CartSummary>();
  selectedShipping = input.required<ShippingOption | null>();
  isLoading = input.required<boolean>();

  //outputs para comunicación con el padre
  shippingSelected = output<string>();
  checkoutRequested = output<void>();

  //Servicios
  cartService = inject(CartService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  //computed : determina si el envio es gratis
  isShippingFree = computed(() => {
    const shipping = this.selectedShipping()
    const subtotal = this.summary().subtotal;

    return shipping?.freeThreshold && subtotal >= shipping.freeThreshold;
  })

  //texto para el badge de envio gratis
  freeShippingText = computed(() => {
    const shipping = this.selectedShipping();
    if (!shipping?.freeThreshold) return '';

    const remaining = shipping.freeThreshold - this.summary().subtotal;

    if (remaining <= 0) {
      return '!Envío gratis aplicado!';
    } else {
      const formatter = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      return `Faltan ${formatter.format(remaining)} para envío gratis`;
    }
  })

  //determina si se puede proceder al checkout
  canCheckout = computed(() => {
    const summary = this.summary();
    return summary.total > 0 && this.selectedShipping() !== null
  })

  //maneja sa selelcion de opcion de envio
  onShippingChange(event: Event): void {
    const selectElemnt = event.target as HTMLSelectElement
    this.shippingSelected.emit(selectElemnt.value);
  }

  //porcede al proceso de checkout
  proceedToCheckout(): void {
    if (!this.canCheckout()) {
      this.alertService.warning(
        'Completa tu pedido',
        'Selecciona un método de envío para continuar'
      );
      return;
    }
    this.checkoutRequested.emit();
  }

  //continua comprando- navega al catálogo
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  //Obtiene la opción de envío seleccionada
  getSelectedShippigOption(): ShippingOption | undefined {
    const selected = this.selectedShipping();
    if (!selected) return undefined;

    return this.cartService.shippingOptions.find(opt => opt.id === selected.id);
  }
}
