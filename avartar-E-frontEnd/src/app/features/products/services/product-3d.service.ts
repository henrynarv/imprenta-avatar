import { effect, inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.interface';
import { Product3dUploadService } from './product-3d-upload.service';

@Injectable({
  providedIn: 'root'
})
export class Product3dService {

  private product3dUploadService = inject(Product3dUploadService);

  // 🔥 CORRECCIÓN: Señales reactivas para estado 3D
  private _selectedColor = signal<string>('#b3478c')
  private _activeProduct = signal<Product | null>(null);
  private _isViewerOpen = signal<boolean>(false);

  // 🔥 CORRECCIÓN MEJORADA: Signal completo para datos del modelo
  private _currentModelData = signal<{
    product: Product | null;
    modelUrl: string;
    defaultColor: string;
    colorableParts: string[];
  } | null>(null);

  // Señales de solo lectura para componentes
  readonly selectedColor = this._selectedColor.asReadonly();
  readonly activeProduct = this._activeProduct.asReadonly();
  readonly isViewerOpen = this._isViewerOpen.asReadonly();
  readonly currentModelData = this._currentModelData.asReadonly(); // 🔥 NUEVO

  constructor() {
    effect(() => {
      console.log('Color 3D actualizado: ', this._selectedColor());
    });

    // 🔥 NUEVO: Effect para debug de cambios en el modelo
    effect(() => {
      const modelData = this._currentModelData();
      console.log('🔄 Product3dService - ModelData actualizado:', {
        hasProduct: !!modelData?.product,
        productName: modelData?.product?.name,
        modelUrl: modelData?.modelUrl,
        defaultColor: modelData?.defaultColor
      });
    });
  }

  // 🔥 CORRECCIÓN MEJORADA: Método completo para establecer datos del modelo
  setCurrentModelData(
    product: Product,
    modelUrl: string,
    defaultColor?: string,
    colorableParts?: string[]
  ): void {
    console.log('🚀 Product3dService - Estableciendo datos del modelo:', {
      product: product.name,
      modelUrl: modelUrl,
      defaultColor: defaultColor,
      colorableParts: colorableParts
    });

    this._currentModelData.set({
      product,
      modelUrl,
      defaultColor: defaultColor || '#FFFFFF',
      colorableParts: colorableParts || ['Object_2']
    });

    // Establecer color inicial automáticamente
    this.setColor(defaultColor || '#FFFFFF');
  }

  // 🔥 NUEVO: Limpiar datos del modelo actual
  clearCurrentModelData(): void {
    console.log('🧹 Product3dService - Limpiando datos del modelo actual');
    this._currentModelData.set(null);
  }

  // Cambia el color seleccionado para los modelos 3D
  setColor(hex: string): void {
    console.log('🎨 Product3dService - Cambiando color a:', hex);
    this._selectedColor.set(hex);
  }

  // Abre el visor 3D con producto específico
  openViewer(product: Product): void {
    console.log('🔄 Product3dService - Abriendo visor para:', product.name);

    this._activeProduct.set(product);
    this._isViewerOpen.set(true);

    // 🔥 CORRECCIÓN: Usar el servicio para establecer datos completos del modelo
    const modelUrl = this.getModelUrl(product);
    this.setCurrentModelData(
      product,
      modelUrl,
      product.model3D?.defaultColor || '#FFFFFF',
      product.model3D?.colorableParts || ['Object_2']
    );
  }

  // Cierra el visor 3D y limpia el estado
  closeViewer(): void {
    console.log('🔄 Product3dService - Cerrando visor 3D');
    this._isViewerOpen.set(false);
    this._activeProduct.set(null);
    this.clearCurrentModelData(); // 🔥 NUEVO: Limpiar datos del modelo
  }

  // Obtiene la URL corregida para el modelo 3D
  getModelUrl(product: Product): string {
    if (!product.model3D?.gltfUrl) {
      console.warn('⚠️ Producto no tiene URL de modelo 3D:', product.name);
      return '';
    }

    const url = product.model3D.gltfUrl;
    const fileName = url.split('/').pop() || url;

    console.log('🔍 Product3dService - Obteniendo URL para:', {
      producto: product.name,
      urlOriginal: url,
      fileName: fileName
    });

    // Si el modelo está guardado en localStorage, recuperar su blob URL
    const localUrl = this.product3dUploadService.getStorageModelUrl(product.id, fileName);
    if (localUrl) {
      console.log('📂 Cargando modelo desde localStorage:', localUrl);
      return localUrl;
    }

    // Si ya es absoluta o relativa válida, usarla directamente
    if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('/')) {
      console.log('🌐 Usando URL directa:', url);
      return url;
    }

    console.log('🔄 Usando URL relativa:', url);
    return `${url}`;
  }

  // 🔥 NUEVO: Método helper para obtener datos actuales
  getCurrentModelInfo() {
    const data = this._currentModelData();
    return {
      hasModel: !!data,
      product: data?.product,
      modelUrl: data?.modelUrl,
      isViewerOpen: this._isViewerOpen()
    };
  }
}
