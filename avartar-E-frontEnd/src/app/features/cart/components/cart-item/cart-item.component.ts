import { Component, computed, inject, input, output, signal } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroMinus, heroPlus, heroTrash } from '@ng-icons/heroicons/outline';
import { CartItem } from '../../models/cart.interface';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-item',
  imports: [CommonModule, NgIcon],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
  providers: [provideIcons({ heroTrash, heroMinus, heroPlus })]
})
export class CartItemComponent {
  //imput signal del carrito a mostrar
  item = input.required<CartItem>();

  //output para comunicacion con el padre
  quantityChanged = output<{ itemId: string, quantity: number }>();
  itemRemoved = output<string>();

  //servicios
  private cartService = inject(CartService);
  private alertService = inject(AlertService);

  //señales para estado del componente
  private _isUpdating = signal<boolean>(false);
  private _isRemoving = signal<boolean>(false);

  //computed properties
  isUpdating = computed(() => this._isUpdating());
  isRemoving = computed(() => this._isRemoving());


  //Precio total por este item(precio x cantidad)
  itemTotal = computed(() => {
    const item = this.item();
    return item.price * item.quantity
  });

  //determina si hay stock disponible para aumentae cantidad
  canIncrease = computed(() => {
    const item = this.item();
    return item.quantity < item.product.stock;
  });

  //determina si se puede disminuir la cantidad(minimo 1)
  canDecrease = computed(() => {
    const item = this.item();
    return item.quantity > 1;
  });


  //Incrementa la cantidad del item en 1
  increaseQuantity(): void {
    if (!this.canIncrease()) {
      this.alertService.warning('Sin stock', 'No hay stock disponible para aumentar la cantidad');
      return;
    }
    this.updateQuantity(this.item().quantity + 1);
  }

  //disminuye la cantidad del item en 1
  decreaseQuantity(): void {
    if (!this.canDecrease()) {
      //Si es 1 preguntar si quiere eliminar
      this.confirmRemove();
      return;
    }

    this.updateQuantity(this.item().quantity - 1);
  }

  //actualiza la cantidad del item con vaidaciones
  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) {
      this.confirmRemove();
    }

    if (newQuantity > this.item().product.stock) {
      this.alertService.warning(
        'Stock insuficiente',
        `Solo hay ${this.item().product.stock} unidades disponibles`
      )
      return;
    }

    this._isUpdating.set(true);

    //simular una pequela demora para mojor ux
    setTimeout(() => {
      this.quantityChanged.emit({
        itemId: this.item().id,
        quantity: newQuantity
      });
      this._isUpdating.set(false);
    }, 300);
  }

  //confirma la eliminacion dle item del carrito
  confirmRemove(): void {
    this._isRemoving.set(true);

    //pequeña demora para la eliminación
    setTimeout(() => {
      this.itemRemoved.emit(this.item().id);
      this._isRemoving.set(false);
    }, 400)
  }

  //Obtine as clases Css para el badge de stock
  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }

  //Obtiene el texto para el badeg de stock
  getStockBadgeText(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return `Últimas ${stock} unidades`;
    return 'En stock';
  }
}
