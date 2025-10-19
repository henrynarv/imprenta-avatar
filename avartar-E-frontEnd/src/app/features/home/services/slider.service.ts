import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { SliderImage } from '../models/slider.interface';
import { delay, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SliderService {

  private http = inject(HttpClient);
  // private apiUrl = `${environment.apiUrl}/slider`;
  private apiUrl = `${'environment.apiUrl'}/slider;`


  // Datos de prueba para la imprenta
  private fakeSliderImages: SliderImage[] = [
    {
      id: '1',
      name: 'Tarjetas de Presentación Premium',
      imageUrl: '/slider/banner-3.webp',
      altText: 'Oferta especial de temporada',
      order: 0,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Folletos Corporativos',
      imageUrl: '/slider/banner-6.webp',
      altText: 'Descubre nuestra nueva colección',
      order: 1,
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: '3',
      name: 'Invitaciones de Boda',
      imageUrl: '/slider/banner-7.webp',
      altText: 'Envío gratis en compras superiores a $50.000',
      order: 2,
      isActive: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-08')
    },

  ];

  //simulate delay de red
  private simulateDelay(): Observable<void> {
    return of(void 0).pipe(delay(300 + Math.random() * 200));
  }

  //Obtiene los datos del slider
  getSliderImages(): Observable<SliderImage[]> {
    return this.simulateDelay().pipe(
      map(() => [...this.fakeSliderImages].sort((a, b) => a.order - b.order))
    )
  }

  /**
  * Obtiene solo las imágenes activas del slider
  */
  getActiveSliderImages(): Observable<SliderImage[]> {
    return this.simulateDelay().pipe(
      map(() => this.fakeSliderImages.filter(img => img.isActive).sort((a, b) => a.order - b.order))
    );
  }
  /**
   * Agrega una nueva imagen al slider con archivo
   */
  addSliderImageWithFile(
    name: string,
    altText: string,
    imageFile: File,
    order: number,
    isActive: boolean
  ): Observable<SliderImage> {
    return this.simulateDelay().pipe(
      map(() => {
        // Crear objeto URL para el archivo local
        const imageUrl = URL.createObjectURL(imageFile);

        const newImage: SliderImage = {
          id: Date.now().toString(),
          name,
          imageUrl,
          altText,
          order,
          isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Agregar a la lista
        this.fakeSliderImages.push(newImage);

        return newImage;
      })
    );
  }

  /**
   * Actualiza una imagen existente con posibilidad de cambiar archivo
   */
  updateSliderImageWithFile(
    imageId: string,
    updates: {
      name: string;
      altText: string;
      order: number;
      isActive: boolean;
      imageFile: File | null;
    }
  ): Observable<SliderImage> {
    return this.simulateDelay().pipe(
      map(() => {
        const imageIndex = this.fakeSliderImages.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
          throw new Error(`Imagen con ID ${imageId} no encontrada`);
        }

        const existingImage = this.fakeSliderImages[imageIndex];
        let imageUrl = existingImage.imageUrl;

        // Si se proporciona nuevo archivo, crear nueva URL
        if (updates.imageFile) {
          // Liberar URL anterior si era local
          if (existingImage.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(existingImage.imageUrl);
          }
          imageUrl = URL.createObjectURL(updates.imageFile);
        }

        const updatedImage: SliderImage = {
          ...existingImage,
          name: updates.name,
          altText: updates.altText,
          order: updates.order,
          isActive: updates.isActive,
          imageUrl,
          updatedAt: new Date()
        };

        // Actualizar en la lista
        this.fakeSliderImages[imageIndex] = updatedImage;

        return updatedImage;
      })
    );
  }

  /**
   * Elimina una imagen del slider
   */
  deleteSliderImage(imageId: string): Observable<boolean> {
    return this.simulateDelay().pipe(
      map(() => {
        const imageIndex = this.fakeSliderImages.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
          throw new Error(`Imagen con ID ${imageId} no encontrada`);
        }

        const imageToDelete = this.fakeSliderImages[imageIndex];

        // Liberar URL si es local
        if (imageToDelete.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageToDelete.imageUrl);
        }

        // Eliminar de la lista
        this.fakeSliderImages.splice(imageIndex, 1);

        return true;
      })
    );
  }

  /**
   * Reordena las imágenes del slider
   */
  reorderSliderImages(images: SliderImage[]): Observable<boolean> {
    return this.simulateDelay().pipe(
      map(() => {
        // Actualizar toda la lista con el nuevo orden
        this.fakeSliderImages = [...images];
        return true;
      })
    );
  }

  /**
   * Método legacy para agregar imagen con URL (mantener por compatibilidad)
   */
  addSliderImage(imageData: any): Observable<SliderImage> {
    return this.simulateDelay().pipe(
      map(() => {
        const newImage: SliderImage = {
          id: Date.now().toString(),
          name: imageData.name,
          imageUrl: imageData.imageUrl,
          altText: imageData.altText,
          order: imageData.order,
          isActive: imageData.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.fakeSliderImages.push(newImage);
        return newImage;
      })
    );
  }

  /**
   * Método legacy para actualizar imagen con URL (mantener por compatibilidad)
   */
  updateSliderImage(imageId: string, updates: any): Observable<SliderImage> {
    return this.simulateDelay().pipe(
      map(() => {
        const imageIndex = this.fakeSliderImages.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
          throw new Error(`Imagen con ID ${imageId} no encontrada`);
        }

        const updatedImage: SliderImage = {
          ...this.fakeSliderImages[imageIndex],
          ...updates,
          updatedAt: new Date()
        };

        this.fakeSliderImages[imageIndex] = updatedImage;
        return updatedImage;
      })
    );
  }


  /*

  private http = inject(HttpClient);

  //signal para almacenar las imagenes del slider
  private _sliderImages = signal<SliderImage[]>([]);

  // computed paa imagenes activas ordenadas
  activeSliderImages = signal<SliderImage[]>([]);

  constructor() {
    this.initializeSampleData();
  }


  //Inicializa datos de ejemplo para desarrollo
  private initializeSampleData(): void {
    const sampleImages: SliderImage[] = [
      {
        id: '1',
        name: 'Oferta Especial',
        imageUrl: '/slider/banner-1.webp',
        altText: 'Oferta especial de temporada',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Nueva Colección',
        imageUrl: 'slider/banner-2.webp',
        altText: 'Descubre nuestra nueva colección',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Envío Gratis',
        imageUrl: 'slider/banner-3.webp',
        altText: 'Envío gratis en compras superiores a $50.000',
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this._sliderImages.set(sampleImages);
    this.updateActiveImages();
  }


  // actualiza la lista de imagenes activas ordenadas
  private updateActiveImages(): void {
    const activeImages = this._sliderImages()
      .filter(image => image.isActive)
      .sort((a, b) => a.order - b.order);

    this.activeSliderImages.set(activeImages);
  }

  //Obtine todas la imagenes del slider
  getSliderImages(): Observable<SliderImage[]> {
    //simula llamada de api
    return of(this._sliderImages()).pipe(delay(500));
  }

  //obtiene las imagens activas pata el slider publico
  getActieveSliderImages(): Observable<SliderImage[]> {
    return of(this.activeSliderImages()).pipe(delay(500));
  }

  //agrega una nueva imagen al slider
  addSliderImage(imageData: Omit<SliderImage, 'id' | 'createdAt' | 'updatedAt'>): Observable<SliderImage> {
    const newImage: SliderImage = {
      ...imageData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };


    const updateImages = [...this._sliderImages(), newImage];
    this._sliderImages.set(updateImages);
    this.updateActiveImages();

    return of(newImage).pipe(delay(500));
  }

  //actualiza na imagen existente
  updateSliderImage(id: string, updates: Partial<SliderImage>): Observable<SliderImage> {
    const updateImages = this._sliderImages().map(image =>
      image.id === id ?
        { ...image, ...updates, updateAt: new Date().toISOString() }
        : image
    );
    this._sliderImages.set(updateImages);
    this.updateActiveImages();

    const upateImage = updateImages.find(img => img.id === id);
    return of(upateImage!).pipe(delay(500));
  }

  //Elimina una imagen del slider
  deleteSliderImage(id: string): Observable<boolean> {
    const filteredImages = this._sliderImages().filter(img => img.id !== id);
    this._sliderImages.set(filteredImages);
    this.updateActiveImages();
    return of(true).pipe(delay(500));
  }

  //reordena las imagenes dle slider
  reorderSliderImages(images: SliderImage[]): Observable<SliderImage[]> {
    this._sliderImages.set(images);
    this.updateActiveImages();

    return of(images).pipe(delay(500));
  }

  // Genera un ID unico para nuevas imagenes
  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}}`;
  }

  */
}
