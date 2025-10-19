import { ChangeDetectorRef, Component, computed, inject, input, output, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBuildingStorefront, heroCheck, heroClock, heroMapPin, heroPhone, heroPhoto, heroPlus, heroXMark } from '@ng-icons/heroicons/outline';
import { PageResponse } from '../../../orders/models/page-response.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../shared/service/alert.service';
import { StoreLocation, CreateLocationRequest } from '../../models/location.interface';
import { min } from 'rxjs';
import { GoogleMap, MapAdvancedMarker } from "@angular/google-maps";
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';



@Component({
  selector: 'app-location-form',
  imports: [NgIcon, ReactiveFormsModule, GoogleMap, MapAdvancedMarker, CommonModule],
  templateUrl: './location-form.component.html',
  styleUrl: './location-form.component.scss',
  providers: [
    provideIcons({
      heroMapPin, heroPhone, heroClock, heroBuildingStorefront,
      heroXMark, heroCheck, heroPhoto, heroPlus
    })
  ]
})
export class LocationFormComponent {
  // INYECCIÓN DE SERVICIOS
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef); // ← Agregar ChangeDetectorRef
  private mapsLoader = inject(GoogleMapsLoaderService);

  @ViewChild(GoogleMap) map!: GoogleMap;

  ngAfterViewInit() {
    // Cancela los InfoWindows automáticos de Google
    this.map.googleMap?.addListener('click', (e: any) => {
      if (e.placeId) {
        e.stop(); // Evita que salga el InfoWindow del lugar
      }
    });
  }



  //INPUTS
  location = input<StoreLocation | null>(null);

  //OUTPUTS
  saved = output<StoreLocation>();
  canceled = output<void>();


  //SiGNAls
  private _isLoading = signal<boolean>(false);
  private _mapCenter = signal<google.maps.LatLngLiteral>({
    lat: -33.4489,
    lng: -70.6693 // Santiago centro
  });

  private _selectedPosition = signal<google.maps.LatLngLiteral | null>(null);


  //mapId PARA MARCADORES AVANZADOS
  mapId = signal('my-store-locator-map'); // Puedes usar cualquier ID único

  // COMPUTED PROPERTIES
  isLoading = computed(() => this._isLoading());
  isEditing = computed(() => !!this.location());
  mapCenter = computed(() => this._mapCenter());
  selectedPosition = computed(() => this._selectedPosition());

  formTitle = computed(() =>
    this.isEditing() ? `Editar ${this.location()?.name}` : 'Nueva Sede'
  );

  submitButtonText = computed(() =>
    this.isLoading() ? 'Guardando...' : this.isEditing() ? 'Actualizar Sede' : 'Crear Sede'
  );


  // FORMULARIO REACTIVO
  locationForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    phone: ['', [Validators.required, Validators.minLength(3)]],
    hours: ['', [Validators.required, Validators.minLength(5)]],
    latitude: [0, [Validators.required]],
    longitude: [0, [Validators.required]]
  });


  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================



  async ngOnInit() {
    try {
      await this.mapsLoader.load();
      // Google Maps está listo, puedes inicializar el mapa
      console.log('Google Maps cargado correctamente');
    } catch (error) {
      console.error('Error cargando Google Maps:', error);
    }

    this.initializeForm();
  }
  //METODOS PUBLICOS

  //manjea el envio d el formulario
  onSubmit(): void {
    this.markFormTouched();

    if (this.locationForm.valid && this.selectedPosition()) {
      this._isLoading.set(true);

      //simular guardadi (en producción se conectaría al servicio)
      setTimeout(() => {
        const formValue = this.locationForm.value;
        const locationData: CreateLocationRequest = {
          name: formValue.name!.trim(),
          address: formValue.address!.trim(),
          phone: formValue.phone!,
          hours: formValue.hours!.trim(),
          latitude: this.selectedPosition()!.lat,
          longitude: this.selectedPosition()!.lng
        };

        const savedLocation: StoreLocation = {
          id: this.isEditing() ? this.location()!.id : Date.now(),
          ...locationData,
          photos: this.isEditing() ? this.location()!.photos : [],
          isActive: true,
          createdAt: this.isEditing() ? this.location()!.createdAt : new Date(),
          updatedAt: new Date()
        };

        this.saved.emit(savedLocation);
        this

        this.alertService.success(
          'Sede guardada',
          `La sede "${savedLocation.name} se ${this.isEditing() ? 'actualizó' : 'creó'} correctamente" ha sido guardada con exito`
        );

        this._isLoading.set(false);

      }, 1000);
    } else {
      this.alertService.error(
        'Formulario inválido',
        'Por favor, complete todos los campos reuqeridos ys elecicone una ubicación en el mapa'
      );
    }
  }

  //cancela la edición o la creación
  onCancel(): void {
    this.canceled.emit();
  }


  //Maneja el clic en el mapara para selecionar ubicacion
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };

      console.log('📍 Posición seleccionada:', position); // ← Para debug

      this._selectedPosition.set(position);
      this._mapCenter.set(position);

      //actualiza campos del formulario
      this.locationForm.patchValue({
        latitude: position.lat,
        longitude: position.lng
      });

      // ✅ FORZAR detección de cambios
      this.cdr.detectChanges();
      // ✅ Mostrar mensaje de confirmación
      this.alertService.success('Exito', 'Ubicación agregada correctamente');

      // ✅ Cerrar cualquier InfoWindow automático de Google Maps (por seguridad extra)
      if (event.domEvent) {
        event.domEvent.stopPropagation?.();
      }
    }

  }

  /**
  * Usa la ubicación actual del usuario
  */
  useCurrentLocation(): void {
    if (navigator.geolocation) {
      this._isLoading.set(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this._selectedPosition.set(userPosition);
          this._mapCenter.set(userPosition);

          this.locationForm.patchValue({
            latitude: userPosition.lat,
            longitude: userPosition.lng
          });

          this._isLoading.set(false);
          this.alertService.info('Ubicación detectada', 'Se ha usado tu ubicación actual');
        },
        (error) => {
          this._isLoading.set(false);
          this.alertService.error(
            'Error de geolocalización',
            'No se pudo obtener tu ubicación actual. Por favor selecciona manualmente en el mapa.'
          );
        }
      );
    } else {
      this.alertService.error(
        'Geolocalización no soportada',
        'Tu navegador no soporta geolocalización. Por favor selecciona manualmente en el mapa.'
      );
    }
  }


  // MÉTODOS PRIVADOS

  //Inicualiza el formulario con  datos existentes su está en modo edición
  private initializeForm(): void {
    if (this.isEditing() && this.location()) {
      const loc = this.location()!;

      this.locationForm.patchValue({
        name: loc.name,
        address: loc.address,
        phone: loc.phone,
        hours: loc.hours,
        latitude: loc.latitude,
        longitude: loc.longitude
      });

      this._selectedPosition.set({
        lat: loc.latitude,
        lng: loc.longitude
      });

      this._mapCenter.set({
        lat: loc.latitude,
        lng: loc.longitude
      });
    }
  }

  // Marca todos los campos como touched para mostrar errores
  private markFormTouched(): void {
    Object.keys(this.locationForm.controls).forEach(key => {
      const control = this.locationForm.get(key);
      control?.markAsTouched();
    })
  }


  // ===========================================================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // ===========================================================================

  // Obtiene clases CSS para campos del formulario
  getFieldClasses(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';

    if (field?.invalid && field?.touched) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50`;
    } else if (field?.valid && field?.touched) {
      return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50`;
    }
    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white`;
  }

  //Obtiene mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.locationForm.get(fieldName);

    if (!field?.touched || !field?.errors) return '';

    const errors = field.errors;

    const errorMessages: Record<string, string> = {
      required: 'Este campo es requerido',
      email: 'Por favor ingrese email válido',
      minlength: `Minimo ${errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Maximo ${errors['maxlength']?.requiredLength} caracteres`,
      pattern: 'Formato no valido',
      min: 'Valor mínimo no alcanzado',
      max: 'Valor maximo excedido'
    };
    for (const key in errors) {
      if (errorMessages[key]) {
        return errorMessages[key];
      }
    }
    return 'Campo invalido';
  }

  //Verifica si un campo tiene un error
  hasError(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }


  //Verifica si el formulario puede ser enviado

  canSubmit(): boolean {
    return this.locationForm.valid && !!this.selectedPosition() && !this.isLoading();
  }
}
