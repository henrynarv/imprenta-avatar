import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal, viewChild, viewChildren } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapInfoWindow } from "@angular/google-maps";
import { StoreLocation } from '../../models/location.interface';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { APP_ASSETS } from '../../../../shared/constants/assets';

@Component({
  selector: 'app-store-map',
  imports: [CommonModule, GoogleMap, MapAdvancedMarker, MapInfoWindow],
  templateUrl: './store-map.component.html',
  styleUrl: './store-map.component.scss'
})
export class StoreMapComponent {

  readonly logoUrlGray = APP_ASSETS.LOGO_GRAY
  readonly logoUrlWhite = APP_ASSETS.LOGO_WHITE;

  //Injectando servico de google maps
  private mapsLoader = inject(GoogleMapsLoaderService);
  private _isInitializing = signal<boolean>(true);

  // =========inputs - cofiguracion desde el padre =========
  locations = input.required<StoreLocation[]>();
  selectedIndex = input<number>(0);
  readonly = input<boolean>(false);
  initialZoom = input<number>(12);
  initialCenter = input<google.maps.LatLngLiteral>({
    lat: -33.4489,
    lng: -70.6693 // Santiago centro
  });

  // ======= OUTPUTS - Comunicación con el componente padre =======
  markerClicked = output<number>();
  centerChanged = output<google.maps.LatLngLiteral>();
  zoomChanged = output<number>();
  viewChanged = output<{ center: google.maps.LatLngLiteral, zoom: number }>();

  // ===========================================================================
  // VIEW REFERENCES
  // ===========================================================================
  private infoWindowRef = viewChild.required(MapInfoWindow);
  private markersRef = viewChildren(MapAdvancedMarker);
  map = viewChild<GoogleMap>('map');

  //SIGNALS - Estado interno de mapal
  private _currentZoom = signal<number>(this.initialZoom());
  private _currentCenter = signal<google.maps.LatLngLiteral>(this.initialCenter());

  // ✅ CACHÉ DE MARKERS - Igual que en tu código funcional
  private markerContentMap = new Map<number, HTMLElement>();

  // ✅ IMAGEN SELECCIONADA - Pre-creada
  private selectedMarker: HTMLElement = (() => {
    const container = document.createElement('div');
    container.className = 'relative w-8 h-8 rounded-full bg-green-600  shadow-lg flex items-center justify-center scale-110';

    const img = document.createElement('img');
    img.src = this.logoUrlWhite;
    img.alt = 'Selected location';
    img.className = 'w-4 h-4 object-contain';

    const badge = document.createElement('div');
    badge.className = 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold';

    container.appendChild(img);
    container.appendChild(badge);
    return container;
  })();

  // ✅ IMAGEN NORMAL - Pre-creada
  private normalMarker: HTMLElement = (() => {
    const container = document.createElement('div');
    container.className = 'relative w-7 h-7 rounded-full bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300';

    const img = document.createElement('img');
    img.src = this.logoUrlGray;
    img.alt = 'Location';
    img.className = 'w-3 h-3 object-contain opacity-50';

    container.appendChild(img);
    return container;
  })();

  async ngOnInit() {
    try {
      await this.mapsLoader.load();
      console.log('Google Maps cargado correctamente');
    } catch (error) {
      console.error('Error al cargar Google Maps', error);
    }
  }

  //computed propiedades
  selectedLocation = computed(() => {
    const locations = this.locations();
    const index = this.selectedIndex();
    return locations[index] || locations[0];
  });

  //Opciones de mapa
  mapOptions = computed<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    mapTypeControl: true,
    streetViewControl: true
  }));

  // ✅ MÉTODO CORREGIDO - Igual que en tu código funcional
  getMarkerContent(index: number): HTMLElement {
    // Si el marcador está seleccionado, devolver el ícono seleccionado
    if (this.selectedIndex() === index) {
      // Actualizar el badge del marker seleccionado
      const badge = this.selectedMarker.querySelector('div');
      if (badge) {
        badge.textContent = (index + 1).toString();
      }
      return this.selectedMarker;
    }

    // Si ya generamos un ícono por defecto para este índice, lo reutilizamos
    if (this.markerContentMap.has(index)) {
      return this.markerContentMap.get(index)!;
    }

    // Si no existe aún, creamos uno nuevo basado en el normalMarker
    const normalMarkerClone = this.normalMarker.cloneNode(true) as HTMLElement;
    this.markerContentMap.set(index, normalMarkerClone);
    return normalMarkerClone;
  }

  // =======metodos publicos =========
  centerOnLocation(location: StoreLocation, zoomLevel: number = 15): void {
    const newCenter = { lat: location.latitude, lng: location.longitude };
    const googleMap = this.map()?.googleMap;

    if (googleMap) {
      googleMap.panTo(newCenter);
      googleMap.setZoom(zoomLevel);
      this._currentCenter.set(newCenter);
      this._currentZoom.set(zoomLevel);
    } else {
      this._currentCenter.set(newCenter);
      this._currentZoom.set(zoomLevel);
    }
  }

  isMarkerVisible(location: StoreLocation): boolean {
    const bounds = this.map()?.getBounds();
    if (!bounds) return false;
    const position = new google.maps.LatLng(location.latitude, location.longitude);
    return bounds.contains(position);
  }

  goToLocation(location: StoreLocation): void {
    const googleMap = this.map()?.googleMap;
    const newCenter = { lat: location.latitude, lng: location.longitude };

    if (googleMap) {
      googleMap.panTo(newCenter);
      googleMap.setZoom(15);
      this._currentCenter.set(newCenter);
      this._currentZoom.set(15);
    } else {
      this._currentCenter.set(newCenter);
      this._currentZoom.set(15);
    }
  }

  openInfoWindowForLocation(location: StoreLocation): void {
    const index = this.locations().findIndex(loc => loc.id === location.id);
    if (index !== -1) {
      this.openInfoWindow(index);
    }
  }

  openSelectedLocationInfoWindow(): void {
    const selectedLocation = this.selectedLocation();
    if (selectedLocation) {
      setTimeout(() => {
        const index = this.locations().findIndex(loc => loc.id === selectedLocation.id);
        if (index !== -1) {
          this.openInfoWindow(index);
        }
      }, 100);
    }
  }

  // ===========================================================================
  // MANEJADORES DE EVENTOS
  // ===========================================================================
  onMarkerClick(index: number): void {
    if (!this.readonly()) {
      this.markerClicked.emit(index);
      this.openInfoWindow(index);
    }
  }

  onCenterChanged(event: google.maps.MapMouseEvent): void {
    if (this._isInitializing()) {
      console.log('🔕 Ignorando center changed durante inicialización');
      return;
    }
    if (event.latLng) {
      const newCenter = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this._currentCenter.set(newCenter);
      this.viewChanged.emit({
        center: newCenter,
        zoom: this._currentZoom()
      });
      this.centerChanged.emit(newCenter);
    }
  }

  onMapReady(map: google.maps.Map): void {
    console.log('✅ Mapa de Google cargado correctamente');
    setTimeout(() => {
      this._isInitializing.set(false);
    }, 2000);
  }

  // ===========================================================================
  // MÉTODOS PRIVADOS
  // ===========================================================================
  private openInfoWindow(index: number): void {
    const markers = this.markersRef();
    const marker = markers[index];
    const location = this.locations()[index];

    if (marker && location) {
      try {
        const content = this.generateInfoWindowContent(location);
        this.infoWindowRef().close();
        setTimeout(() => {
          this.infoWindowRef().open(marker, false, content);
        }, 50);
      } catch (error) {
        console.error('Error opening info window:', error);
      }
    } else {
      console.warn('Marker or location not found for index:', index);
      if (this.locations()[index]) {
        setTimeout(() => this.openInfoWindow(index), 200);
      }
    }
  }

  private generateInfoWindowContent(location: StoreLocation): string {
    const primaryPhoto = location.photos.find(photo => photo.isPrimary) || location.photos[0];
    return `
      <div class="p-2 max-w-xs bg-white rounded-lg">
        <h3 class="font-bold text-lg text-gray-900 mb-2">${location.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${location.address}</p>
        <div class="space-y-1 text-xs text-gray-700 mb-3">
          <p><strong>Teléfono:</strong> ${location.phone}</p>
          <p><strong>Horario:</strong> ${location.hours}</p>
        </div>
        ${primaryPhoto ? `
          <div class="mt-2">
            <img
              src="${primaryPhoto.url}"
              alt="${primaryPhoto.alt}"
              class="w-full h-20 object-cover rounded-lg shadow-sm"
            />
          </div>
        ` : ''}
      </div>
    `;
  }

  //getters para template
  get currenCenter() { return this._currentCenter(); }
  get currentZoom() { return this._currentZoom(); }
}
