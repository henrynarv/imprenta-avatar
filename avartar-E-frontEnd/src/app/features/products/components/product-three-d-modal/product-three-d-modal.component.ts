import { Component, inject, input } from '@angular/core';
import { Product3dService } from '../../services/product-3d.service';

import { heroArrowPath, heroCube, heroMagnifyingGlassPlus, heroPhoto, heroXMark } from '@ng-icons/heroicons/outline';
import { Product3DViewerComponent } from '../product-three-d-viewer/product-three-d-viewer.component';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-3d-modal',
  imports: [CommonModule, NgIcon, Product3DViewerComponent],
  templateUrl: './product-three-d-modal.component.html',
  styleUrl: './product-three-d-modal.component.scss',
  providers: [provideIcons({ heroXMark, heroCube, heroArrowPath, heroPhoto, heroMagnifyingGlassPlus })]
})
export class Product3DModalComponent {
  protected product3DService = inject(Product3dService);

  // ✅ DEFINIR LOS INPUTS CORRECTAMENTE
  product = input.required<Product>();
  isOpen = input.required<boolean>();


  // Estado computado del servicio
  isViewerOpen = this.product3DService.isViewerOpen;
  activeProduct = this.product3DService.activeProduct;
  selectedColor = this.product3DService.selectedColor;
  // isLoading = this.product3DService.isLoading;

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.product3DService.closeViewer();
  }

  //Color por defecto dle produto o color inicial
  get defaultColor(): string {
    return this.activeProduct()?.model3D?.defaultColor || '#FFFFFF';
  }

  //resetar color al valor por defecto
  resetColor(): void {
    this.product3DService.setColor(this.defaultColor);
  }

  /**
   * Maneja cambios en el selector de color
   */
  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.product3DService.setColor(input.value);
  }

  /**
   * Restablece la rotación del modelo
   */
  resetRotation(): void {
    // Lógica para resetear controles de órbita
    console.log('Rotación restablecida');
  }

  //tr
}
