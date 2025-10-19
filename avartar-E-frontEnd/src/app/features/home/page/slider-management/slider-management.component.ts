import { Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowDown, heroArrowUp, heroCheck, heroPencilSquare, heroPhoto, heroPlus, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { SliderService } from '../../services/slider.service';
import { AlertService } from '../../../../shared/service/alert.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SliderImage } from '../../models/slider.interface';
import { CommonModule } from '@angular/common';
import { min, startWith } from 'rxjs';

interface ImageFile extends File {
  preview?: string;
}


@Component({
  selector: 'app-slider-management',
  imports: [NgIcon, ReactiveFormsModule, CommonModule],
  templateUrl: './slider-management.component.html',
  styleUrl: './slider-management.component.scss',
  providers: [
    provideIcons({
      heroPlus,
      heroTrash,
      heroPencilSquare,
      heroArrowUp,
      heroArrowDown,
      heroPhoto,
      heroXMark,
      heroCheck
    })
  ],
})
export class SliderManagementComponent {

  // ========== INYECCIÓN DE SERVICIOS ==========
  private sliderService = inject(SliderService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);


  // ========== SIGNALS PARA ESTADO REACTIVO ==========
  private _sliderImages = signal<SliderImage[]>([]);
  private _isLoading = signal<boolean>(true);
  private _showAddForm = signal<boolean>(false);
  private _editingImageId = signal<string | null>(null);
  private _isSubmitting = signal<boolean>(false);
  private _isReordering = signal<boolean>(false);
  private _selectedFile = signal<ImageFile | null>(null);
  private _selectedFilePreview = signal<string | null>(null);
  private _isDragOver = signal<boolean>(false);


  // ========== COMPUTED PROPERTIES ==========
  sliderImages = this._sliderImages.asReadonly();
  isLoading = this._isLoading.asReadonly();
  showAddForm = this._showAddForm.asReadonly();
  editingImageId = this._editingImageId.asReadonly();
  isSubmitting = this._isSubmitting.asReadonly();
  isReordering = this._isReordering.asReadonly();
  selectedFile = this._selectedFile.asReadonly();
  selectedFilePreview = this._selectedFilePreview.asReadonly();
  isDragOver = this._isDragOver.asReadonly();
  // isAdmin = this.authService.userRole() === 'admin';


  //formulario reactivo

  imageForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    imageFile: [null as File | null, this.getFileValidators()],
    altText: ['', [Validators.required, Validators.minLength(5)]],
    order: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  })


  ngOnInit(): void {
    this.loadSliderImages();
  }


  //Carga todas las imágenes del slider desde el servicio
  private loadSliderImages(): void {
    this._isLoading.set(true);

    this.sliderService.getSliderImages().subscribe({
      next: (images) => {
        this._sliderImages.set(images);
        this._isLoading.set(false);
      }, error: (error) => {
        console.error('Error al cargar las imágenes del slider', error);
        this.alertService.error('Error', 'Ocurrio un error al cargar las imágenes del slider');
        this._isLoading.set(false);
      }
    });
  }



  // ==========Manejo de archivos

  // Obtine validadores dinámicos para el campo de ac¿rchivo
  private getFileValidators() {
    return this.editingImageId() ?
      [] : // No requerido en edicción(puede manteber la imagen actua)
      [Validators.required];
  }

  //manejo d esellecion de archivo por input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.proccesFile(input.files[0]);
    }
  }

  //MAneja el evento de soltar archvivo(drag and drop)
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.proccesFile(event.dataTransfer.files[0]);
    }
  }

  //Manjea el evento de arrastrar sobre el area
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(true);
  }

  //maneja el evento de salir de área de drop
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this._isDragOver.set(false);
  }


  //procesa  y valida el archivo seleccionado
  private proccesFile(file: File): void {
    //Validacion de tipo y tamaño
    if (!this.isValidImageFile(file)) {
      this.alertService.error('Error', 'Formato de archivo no valido, Use JPEG, JPG, PNG o WEBP (máx. 2MB)');
      return;
    }

    this._selectedFile.set(file);

    //crear preview para mostar al usuario
    const reader = new FileReader();
    reader.onload = (e) => {
      this._selectedFilePreview.set(e.target?.result as string);
    };

    reader.readAsDataURL(file);

    //actualizar formulario
    this.imageForm.patchValue({ imageFile: file });
    this.imageForm.controls.imageFile.updateValueAndValidity();
  }


  //Valida que el archivo saa una imagen valida
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; //2MB
    return validTypes.includes(file.type) && file.size <= maxSize;

  }


  // ========== MANEJO DE URLS DE IMAGEN ==========


  //Obtiene la URL de la imagen para mostrar
  getImageUrl(image: SliderImage): string {
    //si es una URL base64 (imagen local subida)
    if (image.imageUrl.startsWith('data:')) {
      return image.imageUrl;
    }
    //si es una URL externa
    return image.imageUrl;
  }

  //obtiene la URL de la imagen actual en edición
  getCurrentImageUrl(): string {
    const currentImage = this._sliderImages().find(img => img.id === this.editingImageId());
    return currentImage ? this.getImageUrl(currentImage) : '';

  }


  // ========== GESTIÓN DEL FORMULARIO ==========
  //Muestra/oculta el formulario con View Transition

  toggleAddForm(): void {
    this.executeWithViewTransition(() => {
      this._showAddForm.update(value => !value);
      this._editingImageId.set(null);
      this._selectedFile.set(null);
      this._selectedFilePreview.set(null);
      this.imageForm.reset({
        order: this.sliderImages().length,
        isActive: true
      });

    })

  }

  //prepara el formulario para editar una imagen
  editImage(image: SliderImage): void {
    this.executeWithViewTransition(() => {
      this.performEditImage(image);
    })
  }

  //Logica interna para editar imagen
  private performEditImage(image: SliderImage): void {
    this._editingImageId.set(image.id);
    this._showAddForm.set(true);
    this._selectedFile.set(null);
    this._selectedFilePreview.set(null);

    this.imageForm.patchValue({
      name: image.name,
      altText: image.altText,
      order: image.order,
      isActive: image.isActive
    });

    this.imageForm.controls.imageFile.setValidators([]);
    this.imageForm.controls.imageFile.updateValueAndValidity();
  }

  //carga la edición/agregado con wiev Transition
  cancelEdit(): void {
    this.executeWithViewTransition(() => {
      this.performCancelEdit();
    })
  }

  /**
   * Lógica interna para cancelar edición
   */
  private performCancelEdit(): void {
    this._showAddForm.set(false);
    this._editingImageId.set(null);
    this._selectedFile.set(null);
    this._selectedFilePreview.set(null);
    this.imageForm.reset();
  }


  //maneja el envio del fomrulario
  onSubmit(): void {
    if (this.imageForm.valid) {
      this._isSubmitting.set(true);

      const formValue = this.imageForm.value;

      if (this.editingImageId()) {
        this.updateImage(this.editingImageId()!, formValue);
      } else {
        this.addNewImage(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // ========== OPERACIONES CRUD ==========

  /**
   * Agrega nueva imagen al slider
   */
  private addNewImage(formData: any): void {
    this.sliderService.addSliderImageWithFile(
      formData.name!,
      formData.altText!,
      formData.imageFile!,
      formData.order!,
      formData.isActive!
    ).subscribe({
      next: (image) => {
        this.alertService.success('Imagen agregada', 'La imagen se agregó con éxito');
        this.cancelEdit();
        this.loadSliderImages();
        this._isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error al agregar la imagen', error);
        this.alertService.error('Error', 'Ocurrió un error al agregar la imagen');
        this._isSubmitting.set(false);
      }
    });
  }

  /**
   * Actualizar imagen existente
   */
  private updateImage(imageId: string, formData: any): void {
    const updates = {
      name: formData.name!,
      altText: formData.altText!,
      order: formData.order!,
      isActive: formData.isActive!,
      imageFile: formData.imageFile || null
    };

    this.sliderService.updateSliderImageWithFile(imageId, updates).subscribe({
      next: (image) => {
        this.alertService.success('Imagen actualizada', 'La imagen se actualizó con éxito');
        this.cancelEdit();
        this.loadSliderImages();
        this._isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error al actualizar la imagen', error);
        this.alertService.error('Error', 'Ocurrió un error al actualizar la imagen');
        this._isSubmitting.set(false);
      }
    });
  }

  /**
   * Elimina una imagen del slider CON TRANSICIÓN
   */
  // async deleteImageWithTransition(imageId: string): Promise<void> {
  //   const image = this.sliderImages().find(img => img.id === imageId);
  //   const imageName = image?.name || 'Imagen del slider';

  //   const confirmed = await this.alertService.confirmDelete(
  //     imageName,
  //     'imagen del slider'
  //   );

  //   if (confirmed) {
  //     requestAnimationFrame(() => {
  //   this.executeWithViewTransition(() => {
  //     this.performDeleteImage(imageId);
  //   });
  // });
  //   }
  // }

  deleteImageWithTransition(imageId: string): void {
    requestAnimationFrame(() => {
      this.executeWithViewTransition(() => {
        this.performDeleteImage(imageId);
      });
    });
  }


  /**
   * Lógica interna para eliminar imagen
   */
  private performDeleteImage(imageId: string): void {
    // Primero actualizamos el estado local para la animación
    const currentImages = this.sliderImages().filter(img => img.id !== imageId);
    this._sliderImages.set(currentImages);

    // Luego hacemos la llamada al servicio
    this.sliderService.deleteSliderImage(imageId).subscribe({
      next: (success) => {
        if (success) {
          this.alertService.success('Imagen eliminada', 'La imagen se eliminó con éxito');
        } else {
          this.alertService.error('Error', 'Ocurrió un error al eliminar la imagen');
          // Revertir si falla
          this.loadSliderImages();
        }
      },
      error: (error) => {
        console.error('Error al eliminar la imagen', error);
        this.alertService.error('Error', 'Ocurrió un error al eliminar la imagen');
        // Revertir si hay error
        this.loadSliderImages();
      }
    });
  }

  // ========== REORDENAMIENTO CON TRANSICIONES ==========

  /**
   * Mueve una imagen hacia arriba CON TRANSICIÓN
   */
  moveImageUpWithTransition(index: number): void {
    if (index > 0 && !this.isReordering()) {
      this.executeWithViewTransition(() => {
        this.performMoveImageUp(index);
      });
    }
  }

  /**
   * Lógica interna para mover imagen arriba
   */
  private performMoveImageUp(index: number): void {
    this._isReordering.set(true);

    const images = [...this.sliderImages()];
    [images[index], images[index - 1]] = [images[index - 1], images[index]];

    // Actualizar órdenes
    images.forEach((img, i) => img.order = i);

    // Actualizar estado local inmediatamente para la animación
    this._sliderImages.set(images);

    // Luego actualizar en el servidor
    this.updateImageOrder(images);
  }

  /**
   * Mueve una imagen hacia abajo CON TRANSICIÓN
   */
  moveImageDownWithTransition(index: number): void {
    if (index < this.sliderImages().length - 1 && !this.isReordering()) {
      this.executeWithViewTransition(() => {
        this.performMoveImageDown(index);
      });
    }
  }

  /**
   * Lógica interna para mover imagen abajo
   */
  private performMoveImageDown(index: number): void {
    this._isReordering.set(true);

    const images = [...this.sliderImages()];
    [images[index], images[index + 1]] = [images[index + 1], images[index]];

    // Actualizar órdenes
    images.forEach((img, i) => img.order = i);

    // Actualizar estado local inmediatamente para la animación
    this._sliderImages.set(images);

    // Luego actualizar en el servidor
    this.updateImageOrder(images);
  }

  /**
   * Actualiza el orden de las imágenes en el servidor
   */
  private updateImageOrder(images: SliderImage[]): void {
    this.sliderService.reorderSliderImages(images).subscribe({
      next: (success) => {
        if (success) {
          this.alertService.success('Éxito', 'Orden actualizado correctamente');
        } else {
          // Revertir si falla
          this.loadSliderImages();
        }
        this._isReordering.set(false);
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.alertService.error('Error', 'No se pudo actualizar el orden');
        // Revertir si hay error
        this.loadSliderImages();
        this._isReordering.set(false);
      }
    });
  }

  // ========== VIEW TRANSITIONS API ==========

  /**
   * Ejecuta una operación con View Transition si está disponible
   */
  private executeWithViewTransition(operation: () => void): void {
    if (this.supportsViewTransitions()) {
      // @ts-ignore
      console.log("✅ View Transitions soportado, iniciando transición...");
      // @ts-ignore
      document.startViewTransition(() => {
        console.log("🚀 Ejecutando operación dentro de transición");
        operation();
      });
    } else {
      console.log("❌ View Transitions NO soportado, fallback normal");
      operation();
    }
  }

  /**
   * Verifica si el navegador soporta View Transitions API
   */
  private supportsViewTransitions(): boolean {
    return typeof document !== 'undefined' &&
      'startViewTransition' in document;
  }

  // ========== HELPER METHODS ==========

  /**
   * Obtiene clases CSS para inputs basado en estado de validación
   */
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    }

    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  /**
   * Obtiene clases CSS para el área de drop
   */
  getDropZoneClasses(): string {
    const baseClasses = 'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ';

    if (this.isDragOver()) {
      return baseClasses + 'border-blue-500 bg-blue-50';
    }

    if (this.imageForm.controls.imageFile.invalid && this.imageForm.controls.imageFile.touched) {
      return baseClasses + 'border-red-500 bg-red-50';
    }

    return baseClasses + 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100';
  }

  /**
   * Obtiene mensaje de error para archivos
   */
  getFileErrorMessage(): string {
    const errors = this.imageForm.controls.imageFile.errors;
    if (errors?.['required']) {
      return 'La imagen es requerida';
    }
    return 'Selecciona una imagen válida (JPG, PNG, WEBP, máx. 2MB)';
  }

  /**
   * Marca todos los campos del formulario como touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.imageForm.controls).forEach(key => {
      const control = this.imageForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * TrackBy function para optimizar rendimiento de la lista
   */
  trackByImageId(index: number, image: SliderImage): string {
    return image.id;
  }
  /*


    //Injeccionde servicios
    private sliderService = inject(SliderService);
    private alertService = inject(AlertService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    //Signals para el estado del componente
    private _sliderImages = signal<SliderImage[]>([]);
    private _isLoading = signal<boolean>(true);
    private _showAddForm = signal<boolean>(false);
    private _editingImageId = signal<string | null>(null);

    //computed properties
    sliderImages = this._sliderImages.asReadonly();
    isLoading = this._isLoading.asReadonly();
    showAddForm = this._showAddForm.asReadonly();
    editingImageId = this._editingImageId.asReadonly();
    isAdmin = this.authService.userRole() === 'admin';

    //formulario para agergar/editar imágenes
    imageForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.*')]],
      altText: ['', [Validators.required, Validators.minLength(5)]],
      order: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });


    ngOnInit(): void {
      this.loadSliderImages();
    }


    // Carga todas las imagenes del slider
    private loadSliderImages(): void {
      this._isLoading.set(true);

      this.sliderService.getSliderImages().subscribe({
        next: (images) => {
          this._sliderImages.set(images);
          this._isLoading.set(false);
        },
        error: (error) => {
          console.log('Error al cargar iamges del slider', error);
          this.alertService.error('Error', 'Ocurrio un error al cargar las imagenes del slider');
          this._isLoading.set(false);
        }



      })
    }
    // Muestra/oculta el formulario de agregar imagen
    toggleAddForm(): void {
      this._showAddForm.update(value => !value);
      this._editingImageId.set(null);
      this.imageForm.reset({
        order: this.sliderImages().length,
        isActive: true
      });
    }

    // Prepara el formulario para editar una imagen
    editImage(image: SliderImage): void {
      this._editingImageId.set(image.id);
      this._showAddForm.set(true);

      this.imageForm.patchValue({
        name: image.name,
        imageUrl: image.imageUrl,
        altText: image.altText,
        order: image.order,
        isActive: image.isActive
      });
    }


    // Cancela la edición/agregado
    cancelEdit(): void {
      this._showAddForm.set(false);
      this._editingImageId.set(null);
      this.imageForm.reset();
    }

    // Maneja el envío del formulario
    onSubmit(): void {
      if (this.imageForm.valid) {
        const formValue = this.imageForm.value;

        if (this.editingImageId()) {
          //actualizar imagen existente
          this.updateImage(this.editingImageId()!, formValue);
        } else {
          //agregar nueva imagen
          this.addNewImage(formValue);
        }
      }
    }

    //Agrega nueva image al slider
    private addNewImage(formdata: any): void {
      const newImageData = {
        name: formdata.name!,
        imageUrl: formdata.imageUrl!,
        altText: formdata.altText!,
        order: formdata.order!,
        isActive: formdata.isActive!
      };


      this.sliderService.addSliderImage(newImageData).subscribe({
        next: (image) => {
          this.alertService.success('Imagen agregada', 'La imagen se agrego con exito');
          this.cancelEdit();
          this.loadSliderImages();
        },
        error: (error) => {
          console.log('Error al agregar la imagen', error);
          this.alertService.error('Error', 'Ocurrio un error al agregar la imagen');
        }
      });

    }


    //actualizar imagen existente
    private updateImage(imageId: string, formDate: any): void {
      const updates = {
        name: formDate.name!,
        imageUrl: formDate.imageUrl!,
        altText: formDate.altText!,
        order: formDate.order!,
        isActive: formDate.isActive!
      };

      this.sliderService.updateSliderImage(imageId, updates).subscribe({
        next: (image) => {
          this.alertService.success('Imagen actualizada', 'La imagen se actualizo con exito');
          this.cancelEdit();
          this.loadSliderImages();//recarga la list
        },
        error: (error) => {
          console.log('Error al actualizar la imagen', error);
          this.alertService.error('Error', 'Ocurrio un error al actualizar la imagen');
        }
      })

    }
    // Elimina una imagen del slider
    async deleteImage(imageId: string, imageName: string): Promise<void> {
      const confirmed = await this.alertService.confirmDelete(
        imageName,
        'imagen del slider'
      );

      if (confirmed) {
        this.sliderService.deleteSliderImage(imageId).subscribe({
          next: (success) => {
            if (success) {
              this.alertService.success('Imagen eliminada', 'La imagen se elimino con exito');
              this.loadSliderImages();
            } else {
              this.alertService.error('Error', 'Ocurrio un error al eliminar la imagen');
            }
          },
          error: (error) => {
            console.log('Error al eliminar la imagen', error);
            this.alertService.error('Error', 'Ocurrio un error al eliminar la imagen');
          }
        })
      }
    }

    // Mueve una imagen hacia arriba en el orden
    moveImageUp(index: number): void {
      if (index > 0) {
        const images = [...this.sliderImages()];
        [images[index], images[index - 1]] = [images[index - 1], images[index]];

        //actualizar ordenes
        images.forEach((img, i) => img.order = i);
        this.updateImageOrder(images);
      }
    }

    // Mueve una imagen hacia abajo en el orden
    moveImageDown(index: number): void {
      if (index < this.sliderImages().length - 1) {
        const images = [...this.sliderImages()];
        [images[index], images[index + 1]] = [images[index + 1], images[index]];

        // Actualizar órdenes
        images.forEach((img, i) => img.order = i);
        this.updateImageOrder(images);
      }
    }


   //Actualiza el orden de las imágenes

    private updateImageOrder(images: SliderImage[]): void {
      this.sliderService.reorderSliderImages(images).subscribe({
        next: (success) => {
          if (success) {
            this._sliderImages.set(images);
            this.alertService.success('Éxito', 'Orden actualizado correctamente');
          }
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.alertService.error('Error', 'No se pudo actualizar el orden');
        }
      });
    }




     Obtiene las clases CSS para los inputs

    getInputClasses(field: any): string {
      const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

      if (field.invalid && field.touched) {
        return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
      }

      return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
    }


    //TrackBy function para optimización

    trackByImageId(index: number, image: SliderImage): string {
      return image.id;
    }
  */
}
