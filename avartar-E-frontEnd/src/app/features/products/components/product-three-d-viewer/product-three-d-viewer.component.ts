import { CommonModule } from '@angular/common';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { extend, injectLoader, injectStore, NgtArgs, NgtCanvas } from 'angular-three';
import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three-stdlib';

import { Product } from '../../models/product.interface';
import { Product3dService } from '../../services/product-3d.service';
import { ExperienceComponent } from '../experience/experience.component';

extend(THREE);
extend({ OrbitControls })

@Component({
  selector: 'app-product-3d-viewer',
  imports: [CommonModule, NgtArgs, NgtCanvas, ExperienceComponent],
  templateUrl: './product-three-d-viewer.component.html',
  styleUrl: './product-three-d-viewer.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Product3DViewerComponent {

  /*

  modelUrl = input.required<string>();
  defaultColor = input<string>('#FFFFFF');
  colorableParts = input<string[]>(['Object_2']);
  product = input.required<any>();

  readonly sceneGraph = ExperienceComponent;

  // 🔥 CORRECCIÓN: UN SOLO signal para los inputs
  private _sceneGraphInputs = signal<any>(null);

  // 🔥 CORRECCIÓN: Exponer como readonly
  readonly sceneGraphInputs = this._sceneGraphInputs.asReadonly();

  constructor() {
    // 🔥 CORRECCIÓN: Effect que actualiza el signal ÚNICO
    effect(() => {
      const product = this.product();
      const modelUrl = this.modelUrl();
      const defaultColor = this.defaultColor();
      const colorableParts = this.colorableParts();

      console.log('🔄 Product3DViewerComponent - Actualizando inputs:', {
        hasProduct: !!product,
        hasModelUrl: !!modelUrl,
        modelUrl: modelUrl,
        productId: product?.id
      });

      // 🔥 CORRECCIÓN: Solo actualizar cuando TODOS los datos estén disponibles
      if (product && modelUrl && modelUrl.trim() !== '') {
        const inputs = {
          product,
          modelUrl: modelUrl.trim(),
          defaultColor: defaultColor || '#FFFFFF',
          colorableParts: colorableParts || ['Object_2']
        };

        console.log('📤 Product3DViewerComponent - Enviando a Experience:', inputs);
        this._sceneGraphInputs.set(inputs);
      } else {
        console.warn('⏳ Product3DViewerComponent - Esperando datos completos...');
        this._sceneGraphInputs.set(null);
      }
    });
  }

  ngOnInit() {
    console.log('🔗 Product3DViewerComponent - Inicializado con:', {
      modelUrl: this.modelUrl(),
      product: this.product(),
      productModelUrl: this.product()?.model3D?.gltfUrl
    });
  }
    */


  private product3dService = inject(Product3dService);

  modelUrl = input.required<string>();
  defaultColor = input<string>('#FFFFFF');
  colorableParts = input<string[]>(['Object_2']);
  product = input.required<any>();

  readonly sceneGraph = ExperienceComponent;

  // 🔥 SOLUCIÓN: Pasar los inputs directamente como objeto
  readonly sceneGraphInputs = {
    product: this.product,
    modelUrl: this.modelUrl,
    defaultColor: this.defaultColor,
    colorableParts: this.colorableParts
  };

  ngOnInit() {
    console.log('🔗 Product3DViewerComponent - Inicializado con:', {
      modelUrl: this.modelUrl(),
      product: this.product(),
      productModelUrl: this.product()?.model3D?.gltfUrl
    });

    // Establecer color inicial
    const initialColor = this.defaultColor() || '#c0c0c0';
    this.product3dService.setColor(initialColor);
    console.log('🎨 Color inicial establecido:', initialColor);
  }


  constructor() {
    effect(() => {
      const product = this.product();
      const modelUrl = this.modelUrl();
      if (product && modelUrl) {
        this.product3dService.setCurrentModelData(product, modelUrl);
      }
    });
  }
}




