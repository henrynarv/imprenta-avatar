import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroHeartSolid, heroStarSolid } from '@ng-icons/heroicons/solid';

import { Router } from '@angular/router';
import { ProductService } from '../../../features/products/services/product.service';

import { Product } from '../../../features/products/models/product.interface';
import { AlertService } from '../../service/alert.service';
import { heroClock, heroCube, heroEye, heroHeart, heroShoppingCart, heroStar, heroTruck } from '@ng-icons/heroicons/outline';
import { CartService } from '../../../features/cart/services/cart.service';
import { Product3dService } from '../../../features/products/services/product-3d.service';
import { Product3DModalComponent } from "../../../features/products/components/product-three-d-modal/product-three-d-modal.component";
import { ProductManagerService } from '../../../features/products/services/product-manager.service';

// export interface Products {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   image: string;
//   stock: number;
//   rating?: number
// }

@Component({
  selector: 'app-product-card',
  imports: [FormsModule, CommonModule, NgIcon, CurrencyPipe, Product3DModalComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  providers: [provideIcons({
    heroStarSolid, heroShoppingCart, heroEye, heroHeart, heroHeartSolid,
    heroStar, heroTruck, heroClock, heroCube
  })]
})

export class ProductCardComponent {

  cartService = inject(CartService);


  //Inputs para configuracion flexible
  product = input.required<Product>();
  showActions = input<boolean>(true);
  showDescription = input<boolean>(true);
  showSpecifications = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md'); //tamaños predefinidos

  // Outputs para comunicación con el componente padre
  productClicked = output<Product>();
  addToCartClicked = output<Product>();
  quickViewClicked = output<Product>();

  //Inyeccionde servicios
  private router = inject(Router);
  // private productService = inject(ProductManagerService);
  private alertService = inject(AlertService);

  private product3DService = inject(Product3dService);

  // Signals del componente
  private _isHovered = signal<boolean>(false);
  private _isFavorite = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);
  private _show3DModal = signal<boolean>(false);

  // computed properties
  isHovered = computed(() => this._isHovered());
  isFavorite = computed(() => this._isFavorite());
  isLoading = computed(() => this._isLoading());
  show3DModal = this._show3DModal.asReadonly();

  /**
   * Abre el modal 3D para este producto
   */
  onView3D(event: Event): void {
    event.stopPropagation();

    if (this.product().has3DModel) {
      this.product3DService.openViewer(this.product());
      this._show3DModal.set(true);
      console.log('🔮 Abriendo modal 3D para:', this.product().name);
    } else {
      console.warn('⚠️ Producto no tiene modelo 3D:', this.product().name);
    }
  }

  /**
   * Cierra el modal 3D
   */
  close3DModal(): void {
    this._show3DModal.set(false);
    this.product3DService.closeViewer();
    console.log('🔮 Cerrando modal 3D');
  }


  //Computed: Determina si el producto tiene descuento
  hasDiscount = computed(() => {
    const product = this.product();
    return product.originalPrice && product.originalPrice > product.price;
  });


  //Computed: Calcula el porcentaje de descuento
  discountPercentage = computed(() => {
    const product = this.product();
    if (!this.hasDiscount()) return 0;
    return Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
  });

  //Computed: Obtiene las clases CSS según el tamaño
  cardClasses = computed(() => {
    const sizeClasses = {
      sm: 'max-w-xs',
      md: 'max-w-sm',
      lg: 'max-w-md',
    };

    return `bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all
    duration-300 hover:shadow-2xl ${sizeClasses[this.size()]}`;

  })


  //Computed: Obtiene las clases para la imagen
  imageClasses = computed(() => {
    const sizeClasses = {
      'sm': 'h-48',
      'md': 'h-56',
      'lg': 'h-64'
    };
    return `w-full object-cover transition-transform duration-500
    ${sizeClasses[this.size()]} ${this.isHovered() ? 'scale-105' : 'scale-100'}`;
  });

  // maneja el hover sobre el card
  onMouseEnter(): void {
    this._isHovered.set(true);
  }

  //Maneja cuando el mouse sale de la card
  onMouseLeave(): void {
    this._isHovered.set(false);
  }

  //Maneja el click en la card del producto
  onProductClick(): void {
    console.log('🎯 Product ID:', this.product().id);
    this.productClicked.emit(this.product()); // ✅ Solo emite el evento
    this.router.navigate(['/products', this.product().id]);
  }


  navigateWithTransition(path: string[]): void {
    const supportsViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document;

    if (supportsViewTransition) {
      (document as any).startViewTransition(() => {
        this.router.navigate(path);
      });
    } else {
      this.router.navigate(path);
    }
  }
  //Maneja el agregar al carrito
  onAddToCart(event: Event): void {
    event.stopPropagation();// Prevenir navegación

    this._isLoading.set(true);

    try {
      //conetario para probar git
      // this.productService.addToCart(this.product().id, 1);
      this.cartService.addItem(this.product(), 1);
      this.addToCartClicked.emit(this.product());

      // Mostrar alerta de éxito
      // this.alertService.success(
      //   'Producto agregado',
      //   `${this.product().name} se agregó al carrito`
      // );
    } catch (error) {
      this.alertService.error(
        'Error',
        'No se pudo agregar el producto al carrito'
      );
    } finally {
      setTimeout(() => this._isLoading.set(false), 500);
    }
  }

  //maneja la vista previa
  onQuickView(event: Event): void {
    this.quickViewClicked.emit(this.product());
  }

  // Maneja el toggle de favoritos
  onToggleFavorite(event: Event): void {
    event.stopPropagation();//previenir navegación
    this._isFavorite.update(value => !value);

    const action = this.isFavorite() ? 'agregado a' : 'removido de';
    this.alertService.info(
      'Favoritos',
      `${this.product().name} ${action} tus favoritos`
    );
  }

  //Genera las estrellas de rating
  generateStars(rating: number): { filled: number; half: boolean; empty: number } {
    const filled = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - filled - (half ? 1 : 0);

    return { filled, half, empty };
  }

  formatCategory(category: string) {
    return category.replace(/-/g, ' ');
  }

  //Obtiene el color según el stock
  getStockColor(stock: number): string {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock < 10) return 'text-orange-600 bg-orange-50';
    return 'text-green-700 bg-green-50';
  }

  //Obtiene el texto de stock
  getStockText(stock: number): string {
    if (stock === 0) return 'sin stock';
    if (stock < 10) return `Últimas ${stock} unidades`;
    return 'En stock';
  }

  trackByIndex(index: number): number {
    return index;
  }
  /*
  product = input.required<Product>();

  // Servicio del carrito
  private cartService = inject(CartService);

  quantity = signal<number>(1);

  isHovered = signal<boolean>(false);

  // funcion que simula agregar el producto al carrito
  addToCart() {
    this.cartService.addToCarrt();
    console.log(
      `agreagdo al carrito : ${this.product().name} X ${this.quantity()}`
    );

    //activamos animacion micro interactiva
    this.isHovered.set(true);

    //descativamos la animaciondespues de 500ms para resetear
    setTimeout(() => {
      this.isHovered.set(false);
    }, 500)
  }

  getContrast(hex: string): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance >= 128 ? '#000000' : '#FFFFFF';

  }

  */
}
