import { Component, computed, inject, signal } from '@angular/core';
import { LocationFormComponent } from "../../../store-locations/components/location-form/location-form.component";
import { AdminLocationsPageComponent } from "../../../store-locations/pages/admin-locations-page/admin-locations-page.component";
import { CartItemComponent } from "../../components/cart-item/cart-item.component";
import { Product, ProductCategory } from '../../../products/models/product.interface';
import { CommonModule } from '@angular/common';
import { CartItem, CartSummary, ShippingOption } from '../../models/cart.interface';
import { CartSummaryComponent } from "../../components/cart-summary/cart-summary.component";
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/service/alert.service';
import { CdkScrollable } from "@angular/cdk/scrolling";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { heroArrowLeft, heroArrowRight, heroShoppingCart, heroTrash } from '@ng-icons/heroicons/outline';


@Component({
  selector: 'app-cart-page',
  imports: [LocationFormComponent, AdminLocationsPageComponent, CartItemComponent, CommonModule, CartSummaryComponent, CdkScrollable, NgIcon,],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
  providers: [provideIcons({ heroShoppingCart, heroArrowLeft, heroTrash, heroArrowRight })]
})
export class CartPageComponent {

  cartService = inject(CartService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  //señales  del servicio (usamos las computadas de solo lectura)
  items = this.cartService.items;
  summary = this.cartService.summary;
  selectedShipping = this.cartService.selectedShipping;
  isLoading = this.cartService.isLoading;

  //señal local para estado de vaciado
  private _isClearing = signal<boolean>(false);

  //computed properties
  isClearing = computed(() => this._isClearing());
  hasItems = computed(() => this.items().length > 0);
  isEmpty = computed(() => this.items().length === 0);

  ngOnInit() {
    console.log('🛒 Cart page initialized with', this.items().length, 'items');
  }


  //Maneja el cambio de cantidad de un item
  onQuantityChanged(event: { itemId: string, quantity: number }): void {
    this.cartService.updateQuantity(event.itemId, event.quantity);
  }
  //maneja el cambio cantiad de un item
  onItemRemoved(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  //Maneja la selección de envío
  onShippingSelected(shippingId: string): void {
    this.cartService.selectShipping(shippingId);
  }

  // Maneja la solicitud de checkout
  onCheckoutRequested(): void {
    this.proceedToCheckout();
  }

  //Procede al proceso de checkout
  proceedToCheckout(): void {
    if (this.isEmpty()) {
      if (this.isEmpty()) {
        this.alertService.warning('Carrito vacío', 'Agrega productos al carrito antes de continuar');
        return;
      }

      // Aquí podrías navegar a la página de checkout
      this.alertService.success('Listo para pagar', 'Serás redirigido al proceso de pago');
      console.log('🚀 Proceeding to checkout with:', this.items().length, 'items');

      // Temporal: Simular navegación al checkout
      setTimeout(() => {
        // this.router.navigate(['/checkout']);
        this.alertService.info('Checkout', 'Página de checkout en desarrollo');
      }, 1000);
    }
  }
  //vacia completamente el carrito de comformación
  clearCart(): void {
    const itemCount = this.items().length;

    if (itemCount === 0) {
      this.alertService.info('Carrito vacio', 'No hay productos para eliminar');
      return;
    }

    //confirmación antes de vaciar
    if (confirm(`¿Estás seguro de que quieres vaciar el carrito? Se eliminarán ${itemCount} productos.`)) {
      this._isClearing.set(true);

      setTimeout(() => {
        this.cartService.clearCart();
        this._isClearing.set(false);
      }, 500);
    }
  }


  //Obtiene el mensaje para el estado vacío
  getEmptyMessage(): string {
    return 'Tu carrito está vacío. ¡Explora nuestro catálogo y encuentra productos increíbles!';
  }

  //Continúa comprando - navega al catálogo

  continueShopping(): void {
    this.router.navigate(['/products']);
  }



}

