import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { SliderService } from '../../services/slider.service';
import { SliderImage } from '../../models/slider.interface';
// import Swiper from 'swiper';

// import Swiper and modules styles


import { AlertService } from '../../../../shared/service/alert.service';
// import { register } from 'swiper/element/bundle';


// register();

@Component({
  selector: 'app-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',

})
export class SliderComponent {



  private sliderService = inject(SliderService);
  private alertService = inject(AlertService);

  //Signals para el estado dle componente;
  private _sliderImages = signal<SliderImage[]>([]);
  private _isLoading = signal<boolean>(false);
  private _currentSliderIndex = signal<number>(0);

  // computed properties
  sliderImages = this._sliderImages.asReadonly();
  isLoading = this._isLoading.asReadonly();
  currentSliderIndex = this._currentSliderIndex.asReadonly();

  //Auto-Play
  private autoPlayInterval: any;
  private readonly AUTO_PLAY_INTERVAL = 5000;


  ngOnInit(): void {
    this.loadSliderImages();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }


  // onSlideChange(event: any) {
  //   // event.realIndex tiene el índice real
  //   this._currentSliderIndex.set(event.realIndex);
  // }


  // Carga las images activs del slider
  // private loadSliderImages(): void {
  //   this._isLoading.set(true);

  //   this.sliderService.getActieveSliderImages().subscribe({
  //     next: (images) => {
  //       this._sliderImages.set(images);
  //       this._isLoading.set(false);
  //       //Inicia Auto_play si hay imágenes
  //       if (images.length > 1) {
  //         this.startAutoPlay();
  //       }
  //     },
  //     error: (error) => {
  //       console.log('Error al cargar iamges del slider', error);
  //       this._isLoading.set(false);
  //       this.alertService.error('Error', 'Ocurrio un error al cargar las imagenes del slider');
  //     }
  //   });
  // }

  /**
   * Carga todas las imágenes del slider desde el servicio
   */
  private loadSliderImages(): void {
    this._isLoading.set(true);

    this.sliderService.getActiveSliderImages().subscribe({
      next: (images) => {
        this._sliderImages.set(images);
        this._isLoading.set(false);
        if (images.length > 1) {
          this.startAutoPlay();
        }
      },
      error: (error) => {
        console.error('Error al cargar imágenes del slider', error);
        this.alertService.error('Error', 'Ocurrió un error al cargar las imágenes del slider');
        this._isLoading.set(false);
      }
    });
  }

  //AutoPlay
  private startAutoPlay(): void {
    if (this.sliderImages().length > 1) {
      this.autoPlayInterval = setInterval(() => {
        this.goToNext();
      }, this.AUTO_PLAY_INTERVAL)
    }
  }

  // Navegación
  goToSlide(index: number): void {
    this._currentSliderIndex.set(index);
    this.restartAutoPlay();
  }

  goToNext(): void {
    const nextIndex = (this.currentSliderIndex() + 1) % this.sliderImages().length;
    this._currentSliderIndex.set(nextIndex);
    this.restartAutoPlay();
  }

  goToPrev(): void {
    const prevIndex = this.currentSliderIndex() === 0
      ? this.sliderImages().length - 1
      : this.currentSliderIndex() - 1;
    this._currentSliderIndex.set(prevIndex);
    this.restartAutoPlay();
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Eventos
  onSlideClick(slide: SliderImage): void {
    console.log('Se hizo click en la imagen', slide.name);
    // TODO: Implementar navegación o acciones específicas
  }

  // Pausar auto-play al hacer hover (se maneja via CSS + eventos)
  onSliderMouseEnter(): void {
    this.stopAutoPlay();
  }

  onSliderMouseLeave(): void {
    this.startAutoPlay();
  }

  /**
  * TrackBy function para optimizar rendimiento
  */
  trackByImageId(index: number, image: SliderImage): string {
    return image.id;
  }


}


