import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CartItem, Product, ProductCategory, ProductFilters, ProductResponse } from '../models/product.interface';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient)

  //estado del carrito usando signals
  private _cartItems = signal<CartItem[]>([]);
  cartItems = this._cartItems.asReadonly();

  /**
   * Obtiene productos paginados con filtros
   * TODO: Reemplazar con llamadas reales a la API
   */
  getProducts(
    page: number = 0,
    pageSize: number = 12,
    filters?: ProductFilters
  ): Observable<ProductResponse> {
    // Simulación de API call - Reemplazar con HTTP real
    return this._mockGetProducts(page, pageSize, filters);
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: number): Observable<Product> {
    // Simulación de API call - Reemplazar con HTTP real
    return this._mockGetProductById(id);
  }

  /**
   * Obtiene productos destacados
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this._mockGetFeaturedProducts();
  }

  /**
   * Obtiene categorías de productos
   */
  getCategories(): string[] {
    return [
      'tarjetas-de-presentacion',
      'volantes',
      'folletos',
      'postales',
      'invitaciones',
      'sellos',
      'papeleria-corporativa',
      'impresion-digital',
      'gran-formato'
    ];
  }

  /**
   * Agrega un producto al carrito
   */
  addToCart(productId: number, quantity: number = 1, specifications?: any): void {
    const currentItems = this._cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // Actualizar cantidad si ya existe
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this._cartItems.set(updatedItems);
    } else {
      // Agregar nuevo item
      this._cartItems.set([
        ...currentItems,
        { productId, quantity, specifications }
      ]);
    }
  }

  /**
   * Remueve un producto del carrito
   */
  removeFromCart(productId: number): void {
    this._cartItems.set(
      this._cartItems().filter(item => item.productId !== productId)
    );
  }

  /**
   * Limpia el carrito
   */
  clearCart(): void {
    this._cartItems.set([]);
  }

  /**
   * Obtiene el total de items en el carrito
   */
  getCartItemCount(): number {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  }

  /**
 * Actualiza la cantidad de un producto en el carrito
 */
  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  updateCartItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this._cartItems();
    const updatedItems = currentItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );

    this._cartItems.set(updatedItems);
  }

  /**
   * Obtiene el total del carrito
   */
  getCartTotal(): number {
    // En una implementación real, aquí calcularías el total basado en los precios de los productos
    return this._cartItems().reduce((total, item) => total + (item.quantity * 1000), 0); // Precio mock
  }

  // ==========================================================================
  // MÉTODOS DE SIMULACIÓN - REEMPLAZAR CON LLAMADAS REALES A LA API
  // ==========================================================================

  private _mockGetProducts(
    page: number,
    pageSize: number,
    filters?: ProductFilters
  ): Observable<ProductResponse> {
    // Simular delay de red
    return of(this._generateMockProducts(page, pageSize, filters)).pipe(
      delay(600)
    );
  }

  private _mockGetProductById(id: number): Observable<Product> {
    const product = this._generateMockProduct(id);
    return of(product).pipe(delay(300));
  }

  private _mockGetFeaturedProducts(): Observable<Product[]> {
    const featuredProducts = Array.from({ length: 6 }, (_, index) =>
      this._generateMockProduct(index + 100, true)
    );
    return of(featuredProducts).pipe(delay(400));
  }

  private _generateMockProducts(
    page: number,
    pageSize: number,
    filters?: ProductFilters
  ): ProductResponse {
    const totalElements = 48;
    const totalPages = Math.ceil(totalElements / pageSize);

    const allProducts = Array.from({ length: totalElements }, (_, index) =>
      this._generateMockProduct(index + 1)
    );

    // Aplicar filtros
    let filteredProducts = [...allProducts];

    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters?.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.inStock) {
      filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }

    if (filters?.isFeatured) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured);
    }

    // Aplicar ordenamiento
    if (filters?.sortBy) {
      filteredProducts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
          case 'rating':
            return filters.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
          case 'name':
            return filters.sortOrder === 'desc'
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name);
          case 'newest':
            return filters.sortOrder === 'desc'
              ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    // Aplicar paginación
    const startIndex = page * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

    return {
      content: paginatedProducts,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      totalElements: filteredProducts.length,
      number: page,
      size: pageSize,
      first: page === 0,
      last: page >= Math.ceil(filteredProducts.length / pageSize) - 1
    };
  }

  private _generateMockProduct(id: number, isFeatured: boolean = false): Product {
    const categories: ProductCategory[] = [
      'tarjetas-de-presentacion',
      'volantes',
      'folletos',
      'postales',
      'invitaciones',
      'sellos',
      'papeleria-corporativa',
      'impresion-digital',
      'gran-formato'
    ];

    const category = categories[id % categories.length];

    // Precios base por categoría
    const basePrices = {
      'tarjetas-de-presentacion': 29990,
      'volantes': 15990,
      'folletos': 22990,
      'postales': 12990,
      'invitaciones': 18990,
      'sellos': 24990,
      'papeleria-corporativa': 34990,
      'impresion-digital': 9990,
      'gran-formato': 49990
    };

    const price = basePrices[category] + (id % 10) * 1000;
    const hasDiscount = id % 4 === 0;
    const originalPrice = hasDiscount ? price * 1.2 : undefined;
    let num = 1;
    return {
      id,
      name: this._generateProductName(category, id),
      description: this._generateProductDescription(category),
      price,
      originalPrice,
      category,
      // images: [`/assets/images/products/product-${id % 10 + 1}.jpg`],
      images: [`/images/volante_${id++}.jpg`],
      specifications: this._generateSpecifications(category),

      stock: id % 20, // Algunos productos sin stock
      isActive: true,
      isFeatured: isFeatured || id % 6 === 0,
      tags: this._generateTags(category),
      createdAt: new Date(Date.now() - id * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 3 + (id % 20) / 10, // Ratings entre 3.0 y 4.9
      reviewCount: id % 50,
      deliveryTime: `${3 + (id % 7)} días hábiles`,
      minimumOrder: category === 'gran-formato' ? 1 : 50
    };
  }

  private _generateProductName(category: ProductCategory, id: number): string {
    const names = {
      'tarjetas-de-presentacion': [
        'Tarjetas de Presentación Premium',
        'Tarjetas Corporativas Elegantes',
        'Tarjetas de Presentación Económicas'
      ],
      'volantes': [
        'Volantes Publicitarios Full Color',
        'Flyers Promocionales',
        'Volantes de Oferta'
      ],
      'folletos': [
        'Folletos Corporativos',
        'Catálogos de Productos',
        'Brochures Institucionales'
      ],
      'postales': [
        'Postales Turísticas',
        'Postales Publicitarias',
        'Postales Personalizadas'
      ],
      'invitaciones': [
        'Invitaciones de Boda',
        'Invitaciones de Cumpleaños',
        'Invitaciones Corporativas'
      ],
      'sellos': [
        'Sellos Automáticos',
        'Sellos de Fechador',
        'Sellos Personalizados'
      ],
      'papeleria-corporativa': [
        'Papelería Corporativa Completa',
        'Timbres y Membretes',
        'Sobres y Carpeta'
      ],
      'impresion-digital': [
        'Impresión Digital Rápida',
        'Copias a Color',
        'Impresión de Documentos'
      ],
      'gran-formato': [
        'Lona Publicitaria',
        'Vinilo Adhesivo',
        'Backlight para Iluminación'
      ]
    };

    const categoryNames = names[category];
    return categoryNames[id % categoryNames.length];
  }

  private _generateProductDescription(category: ProductCategory): string {
    const descriptions = {
      'tarjetas-de-presentacion': 'Tarjetas de presentación de alta calidad en papel premium. Perfectas para networking profesional.',
      'volantes': 'Volantes publicitarios en full color para promocionar tus productos y servicios.',
      'folletos': 'Folletos corporativos con diseño profesional para presentar tu empresa.',
      'postales': 'Postales personalizadas para campañas de marketing directo.',
      'invitaciones': 'Invitaciones elegantes para tus eventos especiales.',
      'sellos': 'Sellos de calidad profesional para tu negocio.',
      'papeleria-corporativa': 'Kit completo de papelería corporativa para tu empresa.',
      'impresion-digital': 'Servicio rápido de impresión digital para tus proyectos.',
      'gran-formato': 'Impresiones en gran formato para publicidad exterior e interior.'
    };

    return descriptions[category];
  }

  private _generateSpecifications(category: ProductCategory): any {
    const baseSpecs = {
      deliveryDays: 3 + (Math.random() * 4 | 0)
    };

    const categorySpecs = {
      'tarjetas-de-presentacion': {
        paperType: 'Cartulina Premium 300gr',
        size: '8.5x5.5cm',
        color: 'Full Color',
        finish: 'Brillo UV'
      },
      'volantes': {
        paperType: 'Bond 90gr',
        size: 'A5',
        color: 'Full Color',
        finish: 'Mate'
      },
      'folletos': {
        paperType: 'Couche 150gr',
        size: 'A4',
        color: 'Full Color',
        finish: 'Brillo'
      },
      'postales': {
        paperType: 'Cartulina 250gr',
        size: '10x15cm',
        color: 'Full Color',
        finish: 'Mate'
      },
      'invitaciones': {
        paperType: 'Cartulina Especial 280gr',
        size: '12x17cm',
        color: 'Full Color',
        finish: 'Relieve'
      },
      'sellos': {
        material: 'Goma Fotopolímero',
        size: '4x6cm',
        printingMethod: 'Láser'
      },
      'papeleria-corporativa': {
        paperType: 'Bond Premium 100gr',
        packaging: 'Caja Personalizada'
      },
      'impresion-digital': {
        printingMethod: 'Digital Color',
        paperType: 'Bond 75gr'
      },
      'gran-formato': {
        material: 'Lona Vinílica',
        printingMethod: 'Plotter de Impresión',
        finish: 'Laminado'
      }
    };

    return { ...baseSpecs, ...categorySpecs[category] };
  }

  private _generateTags(category: ProductCategory): string[] {
    const baseTags = ['imprenta', 'chile', 'profesional'];

    const categoryTags = {
      'tarjetas-de-presentacion': ['tarjetas', 'presentacion', 'corporativo'],
      'volantes': ['volantes', 'publicidad', 'promocion'],
      'folletos': ['folletos', 'catalogos', 'corporativo'],
      'postales': ['postales', 'turismo', 'marketing'],
      'invitaciones': ['invitaciones', 'eventos', 'bodas'],
      'sellos': ['sellos', 'timbres', 'oficina'],
      'papeleria-corporativa': ['papeleria', 'corporativo', 'membretes'],
      'impresion-digital': ['digital', 'rapido', 'copias'],
      'gran-formato': ['gran-formato', 'publicidad', 'exterior']
    };

    return [...baseTags, ...categoryTags[category]];
  }
}
