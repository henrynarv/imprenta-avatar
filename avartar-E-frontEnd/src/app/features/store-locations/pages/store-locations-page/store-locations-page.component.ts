import { Component, computed, inject, signal, ViewChild, viewChild } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { sign } from 'chart.js/helpers';
import { AlertService } from '../../../../shared/service/alert.service';
import { LocationListComponent } from "../../components/location-list/location-list.component";
import { PhotoGalleryComponent } from "../../components/photo-gallery/photo-gallery.component";
import { StoreMapComponent } from "../../components/store-map/store-map.component";
import { StoreLocation } from '../../models/location.interface';
import { heroEye, heroMap } from '@ng-icons/heroicons/outline';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { MapViewState } from '../../models/map-state.interface';


@Component({
  selector: 'app-store-locations-page',
  imports: [LocationListComponent, PhotoGalleryComponent, StoreMapComponent, NgIcon],
  templateUrl: './store-locations-page.component.html',
  styleUrl: './store-locations-page.component.scss',
  providers: [provideIcons({ heroEye, heroMap })]

})
export class StoreLocationsPageComponent {
  //Inyectar servicio
  private locationService = inject(LocationService)
  private alertService = inject(AlertService)
  private mapsLoader = inject(GoogleMapsLoaderService)



  //señales del componente
  private _isLoading = signal<boolean>(true);
  private _selectedIndex = signal<number>(0);
  private _showPhotos = signal<boolean>(false);

  private _lastCenteredLocationId = signal<number | null>(null);


  // storeMap = viewChild<StoreMapComponent>(StoreMapComponent);
  @ViewChild(StoreMapComponent) storeMap!: StoreMapComponent;

  // computed de la propiredades
  isLoading = this._isLoading.asReadonly();
  selectedIndex = this._selectedIndex.asReadonly();
  showPhotos = this._showPhotos.asReadonly();


  locations = this.locationService.locations;

  selectedLocation = computed(() => {
    const allLocations = this.locations();
    const index = this._selectedIndex();
    return allLocations[index];
  })


  // ✅ COMPUTED: Siempre obtener centro desde la ubicación seleccionada
  currentMapState = computed(() => {
    const selectedLoc = this.selectedLocation();

    if (!selectedLoc) {
      return {
        center: { lat: -33.4489, lng: -70.6693 }, // Fallback Santiago
        zoom: 12
      };
    }

    // ✅ SIEMPRE usar la ubicación seleccionada de la lista
    return {
      center: {
        lat: selectedLoc.latitude,
        lng: selectedLoc.longitude
      },
      zoom: 15 // Zoom cercano para ver detalles
    };
  });


  //Toggle con gestión de estado profesional
  togglePhotos(): void {
    console.log('🔄 Cambiando entre mapa y fotos para:', this.selectedLocation()?.name);
    const wasShowingPhotos = this.showPhotos();
    this._showPhotos.set(!this._showPhotos());

    // ✅ SI CAMBIAMOS DE FOTOS A MAPA, centrar en la ubicación seleccionada
    if (wasShowingPhotos && !this.showPhotos()) {
      console.log('🔄 Cambiando de fotos a mapa - centrando en selección actual');
      // Pequeño delay para que el mapa se renderice
      setTimeout(() => {
        this.centerOnSelectedLocation();


        // ✅ ABRIR INFO WINDOW después de centrar
        if (this.storeMap) {
          setTimeout(() => {
            this.storeMap.openSelectedLocationInfoWindow();
            console.log('✅ InfoWindow abierto para:', this.selectedLocation()?.name);
          }, 500); // Delay adicional para asegurar que el mapa esté listo
        }
      }, 300);
    }

  }



  async ngOnInit() {
    try {
      await this.mapsLoader.load();
      // Google Maps está listo, puedes inicializar el mapa
      console.log('Google Maps cargado correctamente');
    } catch (error) {
      console.error('Error cargando Google Maps:', error);
    }

    this.loadLocations();
  }

  //Carga las ubicaciones desde el servicio
  loadLocations(): void {
    this._isLoading.set(true);

    this.locationService.getAllLocations().subscribe({
      next: () => {
        this._isLoading.set(false);
        // Abrir el InfoWindow de la primera ubicación después de cargar
        setTimeout(() => {
          if (this.storeMap && this.locations().length > 0) {
            this.storeMap.openSelectedLocationInfoWindow();
          }
        }, 500);
      },
      error: (error) => {
        console.log('Error al cargar las ubicaciones:', error);
        this.alertService.error('Error', 'Error al cargar las ubicaciones');
        this._isLoading.set(false);
      }
    })
  }

  // onLocationCentered - solo si el mapa está visible
  onLocationCentered(event: { location: StoreLocation, index: number }): void {

    console.log('📍 Evento locationCentered recibido:', {
      location: event.location.name,
      index: event.index,
      showPhotos: this.showPhotos(), // ✅ VERIFICAR estado
      mapAvailable: !!this.storeMap
    });

    const previosIndex = this._selectedIndex();
    this._selectedIndex.set(event.index);

    //Solo centra si el mapaa esta visible y disponible
    if (!this.showPhotos() || !this.storeMap) {
      console.log('Mapa visivle - centrado ubicacion...');
      this.centerOnSelectedLocation();
    } else {
      console.log('🔕 Mapa no visible - guardando selección pero no centrando');
      // La selección se guarda, pero no intentamos centrar un mapa que no existe
    }


    // //centra el mapa en la ubicación selecionada
    // this.storeMap.centerOnLocation(event.location);
    // this._selectedIndex.set(event.index);

  }

  //Maneja la selección de una ubicación desde la lista
  onLocationSelected(index: number): void {

    console.log('📍 Evento locationSelected recibido, índice:', index, 'showPhotos:', this.showPhotos());
    const previousIndex = this._selectedIndex();
    this._selectedIndex.set(index);

    //Solo acciones is el ammpa esta visible
    if (!this.showPhotos()) {
      if (previousIndex !== index) {
        this.centerOnSelectedLocation();
      }
      // Abrir el InfoWindow solo si el mapa esta disponible
      setTimeout(() => {
        if (this.storeMap) {
          this.storeMap.openSelectedLocationInfoWindow();
        }
      }, 100);

    }


  }

  //Maneja el clic en un marcador del mapa
  onMarkerClicked(index: number): void {
    this._selectedIndex.set(index);

    //Hacer scroll al elemento en la lsita
    this.scrollToLocationInList(index);
  }

  //Actualizar estado cuando el mapa cambie


  //Hace scroll a una ubicación especifica en la lista
  private scrollToLocationInList(index: number): void {
    //usar setTimeout para esperar que el DOM se haya actuaizado
    setTimeout(() => {
      const listElement = document.querySelector(`[data-location-index="${index}"]`);
      if (listElement) {
        listElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100)
  }




  // ✅ MÉTODO MEJORADO: centerOnSelectedLocation con verificación completa
  centerOnSelectedLocation(): void {
    // ✅ VERIFICAR que el mapa esté visible Y disponible
    if (this.showPhotos() || !this.storeMap) {
      console.warn('❌ No se puede centrar - mapa no visible o no disponible', {
        showPhotos: this.showPhotos(),
        storeMapAvailable: !!this.storeMap
      });
      return;
    }

    const location = this.selectedLocation();
    if (!location) {
      console.warn('❌ No hay ubicación seleccionada');
      return;
    }

    //Verificar si ya centramois esta ubicacion recientemente
    if (this._lastCenteredLocationId() === location.id) {
      console.log('🔕 Ya centramos esta ubicación recientemente, omitiendo');
      return;
    }
    console.log('🎯 Centrando mapa en:', location.name);

    this._lastCenteredLocationId.set(location.id);
    this.storeMap.centerOnLocation(location);

    setTimeout(() => {
      this._lastCenteredLocationId.set(null);
    }, 2000);
  }


}

