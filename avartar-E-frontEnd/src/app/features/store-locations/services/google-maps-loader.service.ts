import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {

  private apiKey = environment.googleMapsApiKey;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.loadPromise) {
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && google.maps) {
          this.loaded = true;
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&loading=async&libraries=marker`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.loaded = true;
          resolve();
        };

        script.onerror = (error) => {
          reject(new Error('Error al cargar Google Maps'));
        };

        document.head.appendChild(script);
      });
    }

    return this.loadPromise;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  constructor() { }
}
