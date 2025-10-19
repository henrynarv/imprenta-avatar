import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroClock, heroMapPin, heroPhone } from '@ng-icons/heroicons/outline';
import { StoreLocation } from '../../models/location.interface';

@Component({
  selector: 'app-location-list',
  imports: [NgIcon, CommonModule],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss',
  providers: [
    provideIcons({ heroMapPin, heroPhone, heroClock })
  ]
})
export class LocationListComponent {

  //INPUTS
  locations = input.required<StoreLocation[]>();
  selectedIndex = input<number>(0);
  showActions = input<boolean>(false);


  //OUTPUTS
  locationSelected = output<number>();
  locationEdit = output<StoreLocation>();
  locationDelete = output<StoreLocation>();
  locationCentered = output<{ location: StoreLocation, index: number }>();

  // COMPUTED PROPERTIES
  //ubicaciones activas filtradas
  activeLocations = computed(() =>
    this.locations().filter(loc => loc.isActive)
  )

  // MÉTODOS PÚBLICOS


  //Maneja la selección de una ubicación
  selectLocation(location: StoreLocation, index: number): void {
    console.log('🖱️ Seleccionando ubicación:', location.name);



    // ✅ SIEMPRE emitir locationSelected (para actualizar UI)
    this.locationSelected.emit(index);

    // ✅ SOLO emitir locationCentered si es probable que el mapa esté visible
    // Esto evita errores cuando el mapa no existe
    this.locationCentered.emit({ location, index });

    console.log('✅ Eventos emitidos para:', location.name);
  }

  //Maneja la edición de una ubicación
  editLocation(location: StoreLocation, event: Event): void {
    event.stopPropagation();
    this.locationEdit.emit(location);
  }

  //Maneja la eliminacion de u a ubicación
  deleteLocation(location: StoreLocation, event: Event): void {
    event.stopPropagation();
    this.locationDelete.emit(location);
  }


  //Obtiene las clases CSS para el item basado en sleccion
  getItemClasses(index: number): string {
    const baseClasses = 'p-4  cursor-pointer transition-all duration-200 border-b';

    if (this.selectedIndex() === index) {
      return `${baseClasses} border border-green-500 rounded-lg bg-green-50/30  hover:border-gray-300 hover:bg-gray-50 `;
    }

    return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
  }
}
