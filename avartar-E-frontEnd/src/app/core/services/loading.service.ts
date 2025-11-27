import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  //señal para el estado de laoding
  private _isLoading = signal<boolean>(false);

  //computed properti para el acceso reactivo
  isLoading = this._isLoading.asReadonly();

  //contador de request activos
  private activeRequests: number = 0;

  //muestra el loading spiner
  show(): void {
    this.activeRequests++;
    //solo mostrar si es el primer request
    if (this.activeRequests === 1) {
      this._isLoading.set(true);
    }

  }

  // Oculta el loading spinner
  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    // Solo ocultar cuando no hay requests activos
    if (this.activeRequests === 0) {
      this._isLoading.set(false);
    }
  }

  //Resetea el estado de loading (Util para manejo de errores)

  reset(): void {
    this.activeRequests = 0;
    this._isLoading.set(false);
  }

}
