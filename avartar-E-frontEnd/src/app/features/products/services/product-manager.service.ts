import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AlertService } from '../../../shared/service/alert.service';
import { Product } from '../models/product.interface';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductManagerService {

  private alertService = inject(AlertService)

  //señales para el estado dle producto
  private _products = signal<Product[]>(this.loadFromStorage())
  private _isLoading = signal<boolean>(false);
  private _serchTerm = signal<string>('');
  private _selectedCategory = signal<string>('');

  //señales computadas de solo lectura
  readonly products = this._products.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly searchTerm = this._serchTerm.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();



  // =====================================
  // Inicio Métodos para vista pública
  // =====================================

  //Obtiene productos activos para vista pública
  //Filtra solo productos activos y con stock
  readonly publicProducts = computed(() => {
    return this.products().filter(product =>
      product.isActive && product.stock > 0
    )
  });

  //Obtiene prodyctos destacados para la ista publica
  readonly featuredProdcuts = computed(() => {
    return this.publicProducts().filter(product => product.isFeatured);
  });

  //obtiene un producto por ID para vista publica
  //solo retorna productos activos
  getPublicProductById(id: number): Product | undefined {
    const product = this.products().find(p => p.id === id);
    return product && product.isActive ? product : undefined;
  }

  //filtra productos públicos por categoría
  getPublicProductsByCategory(category: string): Product[] {
    return this.publicProducts().filter(product => product.category === category);
  }

  //buscar productos publicos por término
  searchPublicProducts(term: string): Product[] {
    if (!term.trim()) return this.publicProducts();

    const searchLower = term.toLowerCase();
    return this.publicProducts().filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  // =====================================
  // Fin Métodos para vista pública
  // =====================================


  //computed para filtrra segun la busqueda(nombre,descripcion,tect) y category
  readonly filteredProducts = computed(() => {
    const products = this.products();
    const search = this._serchTerm().toLowerCase();
    const category = this._selectedCategory();

    let filtered = products;

    //filtro por categoria
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.specifications.paperType?.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    return filtered;
  });

  //estadisticas para el dashboard
  readonly stats = computed(() => {
    const products = this.products();
    return {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      inactive: products.filter(p => !p.isActive).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      featured: products.filter(p => p.isFeatured).length
    }
  })


  constructor() {
    effect(() => {
      const products = this._products();
      this.saveToStorage(products);
    });

    //Iniciar con datos ficticios si no hay nada
    if (this._products().length === 0) {
      this.initializeMockData();
    }
  }

  //crear un nuevo producto
  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void {
    this._isLoading.set(true);

    try {
      const newProduct: Product = {
        ...productData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this._products.update(products => [...products, newProduct]);
      this.alertService.success('Producto creado',
        `${newProduct.name} se ha creado correctamente`);

      //El producto aparece AUTOMÁTICAMENTE en la vista pública si está activo
      console.log('✅ Nuevo producto creado. Disponible en vista pública:', newProduct.isActive);


    } catch (error) {
      this.alertService.error('Error', 'No se pudo crear el producto');
      console.log('Error al crear producto: ', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  //actualizar el producto existente
  updateProduct(id: number, updates: Partial<Product>): void {
    this._isLoading.set(true);

    try {
      this._products.update(products =>
        products.map(product =>
          product.id === id
            ? {
              ...product,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
            : product
        )
      );
      const product = this._products().find(p => p.id === id);
      if (product) {
        this.alertService.success(
          'Producto actualizado',
          `${product.name} se ha actualizado correctamente`
        );
      }
    } catch (error) {
      this.alertService.error('Error', 'No se pudo actualizar el producto');
      console.log('Error al actualizar producto: ', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  //Eliminar el producto
  deleteProduct(id: number): void {
    const product = this._products().find(p => p.id === id);

    if (product) {
      this._products.update(products =>
        products.filter(p => p.id !== id)
      )
    }

    this.alertService.info(
      'Producto eliminado',
      `${product?.name} se ha eliminado correctamente`
    )
  }

  //Duplicare producto (accioncomun en gestion)
  duplicateProduct(id: number): void {
    const original = this.products().find(p => p.id === id);

    if (original) {
      const duplicate: Product = {
        ...original,
        id: this.generateId(),
        name: `${original.name} (Copia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this._products.update(products => [...products, duplicate]);
      this.alertService.success(
        'Producto duplicado',
        `${duplicate.name} se ha duplicado correctamente`
      )
    }
  }

  //Activar/desactivar producto (toggle)
  toggleProductStatus(id: number): void {
    const product = this._products().find(p => p.id === id);
    if (product) {
      this.updateProduct(id, { isActive: !product.isActive });
    }
  }

  //actuaizar stock del producto
  updateStock(id: number, newStock: number): void {
    if (newStock < 0) {
      this.alertService.warning(
        'stock invalido',
        'El stock no puede ser negativo'
      );
      return;
    }
    this.updateProduct(id, { stock: newStock });
  }

  //Gestiond e búsqueda
  setSearchTerm(term: string): void {
    this._serchTerm.set(term);
  }


  //Gestionde filtros por categoria
  setCategoryFilter(category: string): void {
    this._selectedCategory.set(category);
  }

  //limpiar todos los filtros
  clearFilters(): void {
    this._serchTerm.set('');
    this._selectedCategory.set('');
  }

  //Generar ID único
  private generateId(): number {
    const products = this._products();
    return products.length > 0 ? products[products.length - 1].id + 1 : 1;
  }

  //cargar desde localStorage
  private loadFromStorage(): Product[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('imprenta-avatar-products-admin');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.log('Error al leer productos del localStorage: ', error);
      return []
    }
  }

  //Guardar en localstora , luefgo lo puedes eliminar cuando lo
  //conectes a un backend
  private saveToStorage(products: Product[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('imprenta-avatar-products-admin', JSON.stringify(products));
    } catch (error) {
      console.log('Error al guardar productos en el localstorage: ', error);
    }
  }

  //Inicializar con datos mock
  private initializeMockData(): void {
    // Crear algunos productos de ejemplo basados en tu estructura
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Tarjetas de Presentación Premium',
        description: 'Tarjetas de presentación de alta calidad en papel premium.',
        price: 29990,
        originalPrice: 35990,
        category: 'tarjetas-de-presentacion',
        images: ['/images/volante_1.jpg'],
        specifications: {
          paperType: 'Cartulina Premium 300gr',
          size: '8.5x5.5cm',
          color: 'Full Color',
          finish: 'Brillo UV',
          deliveryDays: 3
        },
        stock: 15,
        isActive: true,
        isFeatured: true,
        tags: ['tarjetas', 'presentacion', 'corporativo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.5,
        reviewCount: 23,
        deliveryTime: '3 días hábiles',
        minimumOrder: 50
      },
      {
        id: 2,
        name: 'Volantes Publicitarios Full Color',
        description: 'Volantes publicitarios en full color para promocionar tus productos.',
        price: 15990,
        category: 'volantes',
        images: ['/images/volante_2.jpg'],
        specifications: {
          paperType: 'Bond 90gr',
          size: 'A5',
          color: 'Full Color',
          finish: 'Mate',
          deliveryDays: 2
        },
        stock: 5, // Stock bajo para testing
        isActive: true,
        isFeatured: false,
        tags: ['volantes', 'publicidad', 'promocion'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.2,
        reviewCount: 15,
        deliveryTime: '2 días hábiles',
        minimumOrder: 100
      },
      {
        id: 3,
        name: 'Folletos Corporativos',
        description: 'Folletos corporativos con diseño profesional para presentar tu empresa.',
        price: 22990,
        category: 'folletos',
        images: ['/images/volante_3.jpg'],
        specifications: {
          paperType: 'Couche 150gr',
          size: 'A4',
          color: 'Full Color',
          finish: 'Brillo',
          deliveryDays: 4
        },
        stock: 0, // Sin stock para testing
        isActive: false, // Inactivo para testing
        isFeatured: false,
        tags: ['folletos', 'catalogos', 'corporativo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.7,
        reviewCount: 31,
        deliveryTime: '4 días hábiles',
        minimumOrder: 25
      },
      {
        id: 4,
        name: 'Taza Personalizada Premium',
        description: 'Taza de cerámica de alta calidad con diseño personalizable.',
        price: 15990,
        category: 'impresion-digital',
        images: ['/images/taza.jpg'],
        specifications: {
          paperType: 'Cerámica',
          size: '11oz',
          color: 'Personalizable',
          finish: 'Brillo',
          deliveryDays: 5
        },
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: ['taza', 'personalizable', 'regalo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.8,
        reviewCount: 34,
        deliveryTime: '5 días hábiles',
        minimumOrder: 1,
        // NUEVO: Configuración 3D
        has3DModel: true,
        model3D: {
          gltfUrl: 'scene.gltf', // Tu archivo en public/scene.gltf
          defaultColor: '',
          colorableParts: ['Object_2'],
          // initialRotation: { x: 0, y: 0, z: 0 },
          format: 'gltf',
          createdAt: new Date().toISOString(),
        }
      },
      {
        id: 5,
        name: 'Taza Personalizada Basica',
        description: 'Taza de cerámica de alta calidad con diseño personalizable.',
        price: 15990,
        category: 'impresion-digital',
        images: ['/images/taza.jpg'],
        specifications: {
          paperType: 'Cerámica',
          size: '11oz',
          color: 'Personalizable',
          finish: 'Brillo',
          deliveryDays: 5
        },
        stock: 9,
        isActive: true,
        isFeatured: true,
        tags: ['taza', 'personalizable', 'regalo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.8,
        reviewCount: 34,
        deliveryTime: '5 días hábiles',
        minimumOrder: 1,
        // NUEVO: Configuración 3D
        has3DModel: true,
        model3D: {
          gltfUrl: 'lapicero.glb', // Tu archivo en public/cup.glb
          defaultColor: '',
          colorableParts: ['Object_2'],
          // initialRotation: { x: 0, y: 0, z: 0 },
          format: 'glb',
          createdAt: new Date().toISOString(),
        }
      },
      {
        id: 6,
        name: 'Vaso Térmico Personalizado',
        description: 'Vaso térmico de acero inoxidable para bebidas calientes y frías.',
        price: 24990,
        originalPrice: 29990,
        category: 'impresion-digital',
        images: ['/images/taza.jpg'],
        specifications: {
          material: 'Acero inoxidable',
          size: '16oz',
          color: 'Plateado',
          finish: 'Mate',
          deliveryDays: 6
        },
        stock: 12,
        isActive: true,
        isFeatured: true,
        tags: ['vaso', 'termico', 'acero', 'personalizable'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.9,
        reviewCount: 47,
        deliveryTime: '6 días hábiles',
        minimumOrder: 1,
        // ✅ MODELO 3D ACTIVADO
        has3DModel: true,
        model3D: {
          gltfUrl: 't.glb',
          defaultColor: '#c0c0c0',
          colorableParts: [''],
          format: 'glb',
          fileSize: 2048576,
          createdAt: new Date().toISOString()
        }
      }
    ];

    this._products.set(mockProducts);
  }
}
