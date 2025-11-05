import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';


import { AlertService } from '../../../../shared/service/alert.service';
import { Product } from '../../models/product.interface';
import { firstValueFrom } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroArrowPath, heroArrowsPointingOut, heroCube, heroDocumentText, heroExclamationTriangle, heroHeart, heroMinus, heroPhoto, heroPlus, heroShieldCheck, heroShoppingCart, heroSparkles, heroStar, heroTruck } from '@ng-icons/heroicons/outline';
import { heroHeartSolid, heroStarSolid } from '@ng-icons/heroicons/solid';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/services/cart.service';
import { ProductManagerService } from '../../services/product-manager.service';
import { Product3dService } from '../../services/product-3d.service';
import { Product3DViewerComponent } from "../../components/product-three-d-viewer/product-three-d-viewer.component";


@Component({
  selector: 'app-product-detail-page',
  imports: [NgIcon, CommonModule, Product3DViewerComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.scss',
  providers: [provideIcons({
    heroArrowLeft, heroShoppingCart, heroHeart, heroHeartSolid,
    heroStar, heroStarSolid, heroTruck, heroShieldCheck,
    heroDocumentText, heroArrowsPointingOut, heroSparkles, heroMinus, heroPlus,
    heroExclamationTriangle, heroCube, heroPhoto, heroArrowPath
  })]
})
export class ProductDetailPageComponent {
  //Input binding desd ela ruta - el ID viene automáticamente del parámetro :id
  id = input.required<number>();

  // En el componente TypeScript, agrega esta señal
  private _selectedViewMode = signal<'images' | '3d'>('images');
  selectedViewMode = this._selectedViewMode.asReadonly();

  // Y este método
  selectViewMode(mode: 'images' | '3d'): void {
    this._selectedViewMode.set(mode);
    console.log('🎯 Modo de vista cambiado a:', mode);
  }
  //Servicios
  private router = inject(Router);
  private productService = inject(ProductManagerService);
  private cartService = inject(CartService);
  private alertService = inject(AlertService);

  private product3DService = inject(Product3dService);

  //señales d e estado
  private _product = signal<Product | null>(null);
  private _isLoading = signal<boolean>(true);
  private _isAddingToCart = signal<boolean>(false);
  private _isFavorite = signal<boolean>(false);
  private _isZoomed = signal<boolean>(false);
  private _selectedImage = signal<string | null>(null);
  private _quantity = signal<number>(1);

  //selales computadas
  product = computed(() => this._product());
  isLoading = computed(() => this._isLoading());
  isAddingToCart = computed(() => this._isAddingToCart());
  isFavorite = computed(() => this._isFavorite());
  isZoomed = computed(() => this._isZoomed());
  selectedImage = computed(() => this._selectedImage());
  quantity = computed(() => this._quantity());


  //computed para datos 3D
  has3DModel = computed(() => !!this.product()?.has3DModel);
  selected3DColor = this.product3DService.selectedColor; // Usar el color del servicio

  hasDiscount = computed(() => {
    const product = this.product();
    return !!(product?.originalPrice && product.originalPrice > product.price);
  })



  discountPercentage = computed(() => {
    const product = this.product();
    if (!product || !this.hasDiscount()) return 0;
    return Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
  })

  constructor() {
    effect(() => {
      const id = Number(this.id());
      const products = this.productService.products();

      // Si aún no hay productos cargados, no hacemos nada
      if (products.length === 0) {
        console.log('⏳ Esperando productos...');
        return;
      }

      console.log('🧭 Buscando producto con ID:', id);

      const product = this.productService.getPublicProductById(id);
      if (product) {
        console.log('✅ Producto encontrado:', product.name);
        this._product.set(product);
        this._quantity.set(product.minimumOrder || 1);
      } else {
        console.warn('❌ Producto no encontrado para ID:', id);
        this._product.set(null);
      }

      this._isLoading.set(false);
    });
  }



  private async loadProduct(id: number): Promise<void> {
    this._isLoading.set(true);

    try {
      // Agregar logs para debug
      console.log('🔄 Loading product with ID:', id);

      const product = this.productService.getPublicProductById(id);
      console.log('📦 Product found:', product);

      if (product) {
        this._product.set(product);
        this._quantity.set(product.minimumOrder || 1);

        //PASAR los datos 3D al servicio
        if (product.has3DModel && product.model3D) {
          this.product3DService.setColor(product.model3D.defaultColor);
        }

        console.log('✅ Producto cargado:', product.name);
      } else {
        console.error('❌ Producto no encontrado para ID:', id);
        // this.showError('Error', 'Producto no encontrado o no disponible');
        this._product.set(null);
      }
    } catch (error) {
      console.error('💥 Error loading product:', error);
      // this.showError('Error', 'No se pudo cargar el producto');
      this._product.set(null);
    } finally {
      this._isLoading.set(false);
    }
  }



  //Maneja el cambio de color en el visor 3D
  on3DColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.product3DService.setColor(input.value);
    console.log('Clor 3D cambiado a :', input.value);
  }

  //Restablece el color al valor por defecto del producto
  reset3DColor(): void {
    const defaultColor = this.product()?.model3D?.defaultColor || '#FFFFFF';
    this.product3DService.setColor(defaultColor);
    console.log('🔄 Color 3D restablecido a:', defaultColor);
  }

  private setupViewTransitions(): void {
    // La View Transitions API se maneja automáticamente con los estilos CSS
    // Angular 19 tiene soporte mejorado para View Transitions
  }

  //Navegacion
  goBack() {
    this.navigateWithTransition(['/products']);
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

  //gestuonde imagenes
  selectImage(image: string): void {
    this._selectedImage.set(image);
  }

  zoomImage(): void {
    this._isZoomed.update(zoomed => !zoomed);
  }

  //gestion de cantidad
  increaseQuantity(): void {
    const current = this.quantity();
    const max = this.product()?.stock || 0;
    if (current < max) {
      this._quantity.set(current + 1);
    }
  }

  decreaseQuantity(): void {
    const current = Number(this.quantity()) || 0;
    const prod = this.product();
    const min = prod && prod.minimumOrder !== undefined ? prod.minimumOrder : 1;
    if (!Number.isFinite(current)) return;
    if (current > min) {
      this._quantity.set(current - 1);
    }
  }


  //acciones
  toggleFavorite(event: Event): void {
    event?.stopPropagation();
    this._isFavorite.update(value => !value);

    const action = this.isFavorite() ? 'agregado a' : 'removido de';
    this.alertService.info(
      'Favoritos',
      `${this.product()?.name} ${action} favoritos`
    );
  }

  private addToCartInternal(): boolean {
    const product = this.product();
    if (!product || product.stock === 0) return false;
    this.cartService.addItem(product, this.quantity());
    return true;
  }

  addToCart(): void {
    if (!this.addToCartInternal()) return;
    this.alertService.success('Producto agregado', `${this.product()?.name} se agregó al carrito`);
  }


  buyNow(): void {
    if (this.addToCartInternal()) {
      this.router.navigate(['/cart']);
    }
  }

  // Utilidades
  generateStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) stars.push('full');
    if (hasHalfStar) stars.push('half');
    while (stars.length < 5) stars.push('empty');

    return stars;
  }

  formatCategory(category: string): string {
    return category.replace(/-/g, ' ');
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return `Últimas ${stock} unidades`;
    return 'En stock';
  }

}
