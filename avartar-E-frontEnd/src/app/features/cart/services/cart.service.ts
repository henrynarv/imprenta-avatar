import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AlertService } from '../../../shared/service/alert.service';
import { CartItem, CartSummary, ShippingOption } from '../models/cart.interface';
import { Product } from '../../products/models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private alertService = inject(AlertService);

  //Señales para el estado dle carrito
  private _items = signal<CartItem[]>(this.loadFromStorage());
  private _selectedShipping = signal<ShippingOption | null>(null);
  private _isLoading = signal<boolean>(false);

  //señales computadas de solo lectura para el componente
  items = this._items.asReadonly();
  selectedShipping = this._selectedShipping.asReadonly();
  isLoading = this._isLoading.asReadonly();

  //computed total de items en el carrito(si¿uma cantidades)
  totalItems = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  )


  //subtotal sin imppuestos ni envio
  subtotal = computed(() =>
    this._items().reduce((total, item) => total + (item.price * item.quantity), 0)
  )


  //costo de envio (gratis sobre cierto monto)
  shipping = computed(() => {
    const shippingOption = this._selectedShipping();
    const subtoal = this.subtotal();

    if (!shippingOption) return 0;

    //Envios gratis si supera el monto minimo
    if (shippingOption.freeThreshold && subtoal >= shippingOption.freeThreshold) {
      return 0;
    }

    return shippingOption.price;
  })


  //Impuestos (19% IVA en chile)
  tax = computed(() =>
    // Math.round(this.subtotal() * 0.19)
    // no redondea mantne 2 decimales
    Number((this.subtotal() * 0.19).toFixed(2))
  )


  //Descpeuntos (podria extederse con cupones)
  discount = computed(() => 0)//por ahora sin descuentos


  //Total final a pagar
  total = computed(() =>
    this.subtotal() + this.shipping() + this.tax() - this.discount()
  )

  //resumen comleto dle carrito
  summary = computed((): CartSummary => ({
    subtotal: this.subtotal(),
    shipping: this.shipping(),
    discount: this.discount(),
    tax: this.tax(),
    total: this.total()
  }));

  //Opciones de envio predefinidos
  shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Envío Estándar',
      description: 'Entrega en 3-5 días hábiles',
      price: 3500,
      estimatedDays: 4,
      freeThreshold: 50000 // Envío gratis sobre $50.000
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: 'Entrega en 24-48 horas',
      price: 7000,
      estimatedDays: 2,
      freeThreshold: 80000 // Envío gratis sobre $80.000
    },
    {
      id: 'pickup',
      name: 'Retiro en Tienda',
      description: 'Retira gratis en nuestro local',
      price: 0,
      estimatedDays: 0
    }
  ]


  constructor() {
    //persistir cambios automaticaenge en localstorage
    effect(() => {
      const items = this._items();
      this.saveToStorage(items);
    })
  }


  //Agrega un producto al carrito o incrementa su cantidad si ya existe
  addItem(product: Product, quaintity: number = 1): void {
    this._isLoading.set(true);

    try {
      const existingItem = this._items().find(item => item.productId === product.id);

      if (existingItem) {
        //Si ya existe actualzar cantidad
        this.updateQuantity(existingItem.id, existingItem.quantity + quaintity);
      } else {
        //Si es nuevo crear item
        const newItem: CartItem = {
          id: this.generateId(),
          productId: product.id,
          product: product,
          quantity: quaintity,
          price: product.price,
          addedAt: new Date()
        };
        this._items.update(items => [...items, newItem]);
        this.alertService.success(
          'Agregadoa al carrito',
          `${product.name} se agregó al carrito`
        )
      }
    } catch (error) {
      this.alertService.error(
        'Error',
        'No se pudo agregar el producto al carrito'
      )
      console.log('Error al agregar iten al carrio: ', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  //Actualiza la cantidad de un item especifico
  updateQuantity(itemId: string, quantity: number): void {
    //si la cantidad es cero se elimiba el item
    if (quantity <= 0) {
      this.removeItem(itemId)
      return;
    }

    this._items.update(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }//ninexced el stock
          : item
      )
    );
  }


  //Eliina el item especifico del carrito
  removeItem(itemId: string): void {
    const item = this._items().find(item => item.id === itemId);
    this._items.update(items => items.filter(item => item.id !== itemId));

    if (item) {
      this.alertService.info(
        'Producto eliminado',
        `${item.product.name} ha sido eliminado del carrito`
      )
    }
  }

  //Vacia le acarriro competaamente
  clearCart(): void {
    this._items.set([]);
    this.alertService.info('Carrito vaciado', 'Todos los productos fueron removidos');
  }

  //Seleciona una opción de envio
  selectShipping(shippingId: string): void {
    const option = this.shippingOptions.find(opt => opt.id === shippingId);
    this._selectedShipping.set(option || null);
  }



  //crea un ID único para nuevos items del carrio
  private generateId(): string {
    return `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)};`
  }


  //Carga el carrito desde el localStorage
  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('imprenta-avatar-cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.log('Error al leer el cart del storage ', error);
    }
    return [];
  }

  //Guarda el carrito en el localStorage
  private saveToStorage(items: CartItem[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('imprenta-avatar-cart', JSON.stringify(items));
    } catch (error) {
      console.log('Error al guardar el cart en el storage ', error);
    }
  }

}
