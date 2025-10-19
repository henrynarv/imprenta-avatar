import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { LocationListComponent } from "../../components/location-list/location-list.component";
import { PhotoGalleryComponent } from "../../components/photo-gallery/photo-gallery.component";
import { StoreMapComponent } from "../../components/store-map/store-map.component";
import { AlertService } from '../../../../shared/service/alert.service';
import { Router } from '@angular/router';
import { StoreLocation } from '../../models/location.interface';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { LocationFormComponent } from "../../components/location-form/location-form.component";
import { heroEye, heroMap, heroPencil, heroPlus, heroTrash } from '@ng-icons/heroicons/outline';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';

@Component({
  selector: 'app-admin-locations-page',
  imports: [LocationListComponent, PhotoGalleryComponent, StoreMapComponent, NgIcon, LocationFormComponent],
  templateUrl: './admin-locations-page.component.html',
  styleUrl: './admin-locations-page.component.scss',
  providers: [
    provideIcons({
      heroPlus, heroPencil, heroTrash, heroEye, heroMap
    })
  ]
})
export class AdminLocationsPageComponent {

  private locationService = inject(LocationService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private mapsLoader = inject(GoogleMapsLoaderService);

  // SIGNALS
  private _isLoading = signal<boolean>(true);
  private _selectedIndex = signal<number>(0);
  private _showLocationForm = signal<boolean>(false);
  private _editingLocation = signal<StoreLocation | null>(null);
  private _lastCenteredLocationId = signal<number | null>(null);
  private _showPhotos = signal<boolean>(false);

  editAndSave = signal<boolean>(false);

  @ViewChild(StoreMapComponent) storeMap!: StoreMapComponent


  // COMPUTED PROPERTIES
  isLoading = this._isLoading.asReadonly();
  selectedIndex = this._selectedIndex.asReadonly();
  showLocationForm = this._showLocationForm.asReadonly();
  editingLocation = this._editingLocation.asReadonly();
  showPhotos = this._showPhotos.asReadonly();

  locations = this.locationService.locations;
  // selectedLocation = this.locationService.locations

  // selectedLocation = this.locationService.locations
  // Computed para la ubicación seleccionada
  selectedLocation = computed(() => {
    const allLocations = this.locations();
    const index = this._selectedIndex();
    return allLocations[index]; // Devuelve un solo StoreLocation
  });



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

  // ===========================================================================
  // MÉTODOS PÚBLICOS
  // ===========================================================================


  //Carga las ubicaciones desde el servicio
  loadLocations(): void {
    this._isLoading.set(true);

    this.locationService.getAllLocations().subscribe({
      next: () => {
        this._isLoading.set(false);

        // Abrir el InfoWindow de la primera ubicación
        //TODO VERIFICAR SI ESE TIMEOT SE PEUDE MEJORAR
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


  //centerOnSelectedLocation con verificación completa
  centerOnSelectedLocation(): void {
    //Verificar que el mapa esté visible y disponoble
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

  toggleEditAndSave(): void {
    this.editAndSave.set(!this.editAndSave());
  }

  togglePhotos(): void {

    const wasShowingPhotos = this.showPhotos();
    this._showPhotos.set(!this.showPhotos());

    //Si cambiamos de fotos a mapa, centrar y abre el infowindow
    if (wasShowingPhotos && !this.showPhotos()) {
      // Pequeño delay para que el mapa se renderice
      setTimeout(() => {
        this.centerOnSelectedLocation();


        //Abrinr infoWindow después de centrar
        if (this.storeMap) {
          setTimeout(() => {
            this.storeMap.openSelectedLocationInfoWindow();
            console.log('✅ InfoWindow abierto para:', this.selectedLocation()?.name);
          }, 500);
        }
      }, 300)
    }


  }



  onLocationCentered(event: { location: StoreLocation, index: number }): void {
    //centra el mapa en la ubicación selecionada

    console.log('📍 Evento locationCentered recibido:', {
      location: event.location.name,
      index: event.index,
      showPhotos: this.showPhotos(), // ✅ VERIFICAR estado
      mapAvailable: !!this.storeMap
    });

    const previousIndex = this.selectedIndex();
    this._selectedIndex.set(event.index);

    //Solo centra el mapa si esta disponible
    if (!this.showPhotos() || !this.storeMap) {
      this.centerOnSelectedLocation();
    } else {
      console.log('🔕 Mapa no visible - guardando selección pero no centrando');
      // La selección se guarda, pero no intentamos centrar un mapa que no existe
    }
  }


  //Maneja la selección de una ubicación desde la lista
  onLocationSelected(index: number): void {
    this._selectedIndex.set(index);
    this._editingLocation.set(null);
    this._showLocationForm.set(false);


    const previousIndex = this.selectedIndex();
    this._selectedIndex.set(index);

    //Solo acciones si el mapa está visible
    if (!this.showPhotos()) {
      if (previousIndex !== index) {
        this.centerOnSelectedLocation();
      }
      // Abrir el InfoWindow solo si el mapa está disponible
      setTimeout(() => {
        if (this.storeMap) {
          this.storeMap.openSelectedLocationInfoWindow();
        }
      }, 100);


    } else {
      console.log('🔕 Mapa no visible - guardando selección pero no centrando');
    }


  }

  //Maneja el clic en un marcador del mapa
  onMarkerClicked(index: number): void {
    this._selectedIndex.set(index);

    //Hacer scroll al elemento en la lista
    this.scrollToLocationInList(index);
  }

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
    }, 100);
  }

  //Abre el formulario para crear nueva ubicación
  openCreateForm(): void {
    this._editingLocation.set(null);
    this._showLocationForm.set(true);
  }

  //Abre el formulario para editar la ubicación actual
  openEditForm(): void {
    const currentLocation = this.selectedLocation();
    if (currentLocation) {
      this._editingLocation.set(currentLocation);
      this._showLocationForm.set(true);
    }
  }

  //Maneja la edición desde la lista
  onLocationEdit(location: StoreLocation): void {
    const index = this.locations().findIndex(loc => loc.id === location.id);
    if (index !== -1) {
      this._selectedIndex.set(index);
      this._editingLocation.set(location);
      this._showLocationForm.set(true);
    }
  }

  //Maneja la eliminación desde la lista


  //Cierra el formualrio
  closeForm(): void {
    this._showLocationForm.set(false);
    this._editingLocation.set(null);


    //Actualizar el mapa para mostrar la ubicación seleccinada actual
    setTimeout(() => {
      if (!this.showPhotos() && this.storeMap && this.selectedLocation()) {
        console.log('🔄 Cerrando formulario - actualizando mapa para:', this.selectedLocation()?.name);
        this.centerOnSelectedLocation();

        //Abrir infowindow despues de un breve delay
        setTimeout(() => {
          if (this.storeMap) {
            this.storeMap.openSelectedLocationInfoWindow();
          }
        }, 500)
      }
    }, 100)
  }


  //Manjea la actualizacion de fotos desde la galeria
  onPhotosUpdated(updateLocalLocation: StoreLocation): void {
    //Usar actualización LOCAL para datos ficticios
    this.locationService.updateLocalLocation(updateLocalLocation);
    this.alertService.success('Fotos actualizadas', 'Las fotos han sido actualizadas correctamente.');
  }

  //Maneja la creacion/actualizacion de ubicaciones desde el formuario
  onLocationSaved(savedLocation: StoreLocation): void {
    if (this.editingLocation()) {
      //actualizar ubicación existente
      this.locationService.updateLocalLocation(savedLocation);
      this.alertService.success('Ubicación actualizada', 'La ubicación ha sido actualizada correctamente.');
    } else {
      //agregarnueva ubicacion
      this.locationService.addLocalLocation(savedLocation);
      this.alertService.success('Ubicación creada', 'La ubicación ha sido creada correctamente.');

      //Seleccionar la nueva ubicación
      const newIndex = this.locations().findIndex(loc => loc.id === savedLocation.id);
      if (newIndex !== -1) {
        this._selectedIndex.set(newIndex);
      }
    }

    this.closeForm();
  }


  //Elimina la ubicación actual


  //Elimina una ubicación epsecifica

  //calcular el nuevo indice a sleccinar después de eliminar una ubicación
  private calculateNewSelectedIndex(currentIndex: number, totalLocations: number): number {
    //si no quedan ubicaciones, resetear a 0
    if (totalLocations === 0) {
      return 0;
    }

    //si solo queda una ubicación, seleccionar la única disponible
    if (totalLocations === 1) {
      return 0;
    }
    // En cualquier otro caso, mantener el mismo índice (que ahora apuntará a la siguiente ubicación)
    return currentIndex;
  }



  // VERSIÓN SIMPLIFICADA - Manteniendo los métodos separados pero sincronizados

  private async deleteLocationCore(location: StoreLocation, isCurrent: boolean = false): Promise<void> {
    const locationName = location.name;
    const currentIndex = this._selectedIndex();
    const locationsCount = this.locations().length;

    const confirmed = await this.alertService.confirmDelete(
      locationName,
      'Ubicación del local'
    );

    if (!confirmed) return;

    this._isLoading.set(true);

    this.locationService.deleteLocation(location.id).subscribe({
      next: () => {
        this.locationService.removeLocalLocation(location.id);

        // Lógica común de selección post-eliminación
        if (isCurrent) {
          const newSelectedIndex = this.calculateNewSelectedIndex(currentIndex, locationsCount);
          this._selectedIndex.set(newSelectedIndex);
        }

        this._isLoading.set(false);
        this.alertService.success('Ubicación eliminada', `"${locationName}" se eliminó correctamente`);

        // Comportamiento común post-eliminación
        setTimeout(() => {
          if (this.storeMap && this.locations().length > 0) {
            this.storeMap.openSelectedLocationInfoWindow();
          }
        }, 300);
      },
      error: (error) => {
        this._isLoading.set(false);
        this.alertService.error('Error', 'No se pudo eliminar la ubicación');
        console.error('Error deleting location:', error);
      }
    });
  }

  // Métodos públicos que usan la lógica común
  async deleteCurrentLocation(): Promise<void> {
    const currentLocation = this.selectedLocation();
    if (currentLocation) {
      await this.deleteLocationCore(currentLocation, true);
    }
  }

  async deleteLocation(location: StoreLocation): Promise<void> {
    await this.deleteLocationCore(location, false);
  }

  onLocationDelete(location: StoreLocation): void {
    this.deleteLocation(location);
  }

}
