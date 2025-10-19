import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowsPointingOut, heroCheck, heroPencil, heroPhoto, heroPlus, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { LocationService } from '../../services/location.service';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { StoreLocation, StorePhoto } from '../../models/location.interface';

@Component({
  selector: 'app-photo-gallery',
  imports: [CommonModule, NgIcon, CdkDropList, CdkDrag], // ❌ QUITAR DragDropModule duplicado
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
  providers: [
    provideIcons({
      heroPhoto, heroPlus, heroTrash, heroCheck, heroXMark, heroPencil, heroArrowsPointingOut
    })
  ]
})
export class PhotoGalleryComponent {
  // INYECCIÓN DE SERVICIOS
  private locationService = inject(LocationService);

  // INPUTS
  location = input.required<StoreLocation>();
  isAdmin = input<boolean>(false);
  editable = input<boolean>(false);

  // OUTPUTS
  photosUpdated = output<StoreLocation>();

  // SIGNALS
  private _isLoading = signal<boolean>(false);
  private _isEditing = signal<boolean>(false);

  // COMPUTED PROPERTIES
  isLoading = computed(() => this._isLoading());
  isEditing = computed(() => this._isEditing());

  primaryPhoto = computed(() => {
    const location = this.location();
    return location.photos
      .find(photo => photo.isPrimary) || location.photos[0];
  });

  secondaryPhotos = computed(() => {
    const location = this.location();
    return location.photos
      .filter(photo => !photo.isPrimary)
      .sort((a, b) => a.order - b.order);
  });

  hasPhotos = computed(() => this.location().photos.length > 0)
  hasSecondaryPhotos = computed(() => this.secondaryPhotos().length > 0);

  // Layout de collage
  photoLayout = computed(() => {
    const photos = this.secondaryPhotos();
    return photos.map((photo, index) => {
      const heightPattern = ['h-48', 'h-56', 'h-52', 'h-60', 'h-44'];
      const heightClass = heightPattern[index % heightPattern.length];
      const widthClass = index % 5 === 0 ? 'col-span-2' : 'col-span-1';

      return {
        photo,
        heightClass,
        widthClass
      };
    });
  });

  // MÉTODOS PÚBLICOS
  toggleEditMode(): void {
    if (this.isAdmin()) {
      this._isEditing.update(value => !value);
    }
  }

  async addPhotos(event: Event): Promise<void> {
    if (!this.isAdmin() || !this.isEditing()) return;

    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    this._isLoading.set(true);

    try {
      const newPhotos: StorePhoto[] = Array.from(files).map((file, index) => ({
        id: Date.now() + index, // ✅ Usar Date.now() en lugar de servicio
        url: URL.createObjectURL(file),
        alt: `Nueva foto ${index + 1}`,
        isPrimary: this.location().photos.length === 0,
        order: this.location().photos.length + index,
      }));

      const updatedLocation = {
        ...this.location(),
        photos: [...this.location().photos, ...newPhotos]
      };

      this.photosUpdated.emit(updatedLocation);

    } catch (error) {
      console.error('Error agregando fotos:', error);
    } finally {
      this._isLoading.set(false);
      input.value = '';
    }
  }

  deletePhoto(photoId: number): void {
    if (!this.isAdmin() || !this.isEditing()) return;

    const updatedPhotos = this.location().photos.filter(photo => photo.id !== photoId);

    if (photoId === this.primaryPhoto()?.id && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }

    const updatedLocation = { ...this.location(), photos: updatedPhotos };
    this.photosUpdated.emit(updatedLocation);
  }

  setPrimaryPhoto(photoId: number): void {
    if (!this.isAdmin() || !this.isEditing()) return;

    const photos = [...this.location().photos];
    const photoIndex = photos.findIndex(photo => photo.id === photoId);

    if (photoIndex > -1) { // ✅ CORREGIR: photoIndex > -1 en lugar de photoId > 0
      const [photo] = photos.splice(photoIndex, 1);
      photos.unshift(photo);

      const updatedPhotos = photos.map((p, index) => ({
        ...p,
        isPrimary: index === 0,
        order: index
      }));

      const updatedLocation = { ...this.location(), photos: updatedPhotos };
      this.photosUpdated.emit(updatedLocation);
    }
  }

  // ===========================================================================
  // DRAG & DROP CORREGIDO
  // ===========================================================================

  /**
   * Maneja el drop en TODAS las fotos (sistema unificado)
   */
  onPhotoDrop(event: CdkDragDrop<StorePhoto[]>): void {
    if (!this.isAdmin() || !this.isEditing()) return;

    console.log('🔄 Drop event:', {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      container: event.container.id
    });

    const photos = [...this.location().photos];

    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(photos, event.previousIndex, event.currentIndex);

      // ✅ Actualizar órdenes y foto principal
      const updatedPhotos = photos.map((photo, index) => ({
        ...photo,
        isPrimary: index === 0, // La primera foto siempre es principal
        order: index
      }));

      const updatedLocation = { ...this.location(), photos: updatedPhotos };
      this.photosUpdated.emit(updatedLocation);
    }
  }

  /**
   * Obtiene las clases CSS para las fotos
   */
  getPhotoClasses(layoutItem: any): string {
    const baseClasses = 'relative group transition-all duration-300 rounded-lg overflow-hidden bg-gray-200';

    if (this.isAdmin() && this.isEditing()) {
      return `${baseClasses} cursor-grab active:cursor-grabbing hover:shadow-xl hover:scale-105`;
    }

    return `${baseClasses} cursor-default hover:shadow-lg`;
  }
}
