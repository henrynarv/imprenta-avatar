import { HttpClient } from '@angular/common/http';
import { CreateSignalOptions, inject, Injectable, signal } from '@angular/core';
import { CreateLocationRequest, StoreLocation, UpdateLocationRequest } from '../models/location.interface';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:8080/api';//cambairlo por una pi real

  private apiUrl = environment.apiUrl;







  // ===========================================================================
  // DATOS FICTICIOS - Simulan respuesta de API
  // ===========================================================================
  private mockLocations: StoreLocation[] = [
    {
      id: 1,
      name: 'Sede Central - Providencia',
      address: 'Av. Providencia 1234, Providencia, Santiago',
      phone: '+56 2 2345 6789',
      hours: 'Lun-Vie: 9:00-19:00, Sáb: 10:00-14:00',
      latitude: -33.4345,
      longitude: -70.6305,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      photos: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500',
          alt: 'Fachada moderna sede central',
          isPrimary: true,
          order: 1
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500',
          alt: 'Interior tienda área atención',
          isPrimary: false,
          order: 2
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
          alt: 'Showroom productos imprenta',
          isPrimary: false,
          order: 3
        },
        {
          id: 4,
          url: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=500',
          alt: 'Equipo de trabajo',
          isPrimary: false,
          order: 4
        }
      ]
    },
    {
      id: 2,
      name: 'Sede Las Condes - Alto Las Condes',
      address: 'Av. Apoquindo 5678, Las Condes, Santiago',
      phone: '+56 2 2456 7890',
      hours: 'Lun-Vie: 8:30-18:30, Sáb: 10:00-13:00',
      latitude: -33.4085,
      longitude: -70.5788,
      isActive: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      photos: [
        {
          id: 5,
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
          alt: 'Fachada sede Las Condes',
          isPrimary: true,
          order: 1
        },
        {
          id: 6,
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
          alt: 'Interior moderno equipos',
          isPrimary: false,
          order: 2
        }
      ]
    },
    {
      id: 3,
      name: 'Sede Ñuñoa - Plaza Ñuñoa',
      address: 'Av. Irarrázaval 3456, Ñuñoa, Santiago',
      phone: '+56 2 2567 8901',
      hours: 'Lun-Vie: 9:00-19:00, Sáb: 10:00-14:00',
      latitude: -33.4567,
      longitude: -70.5876,
      isActive: true,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
      photos: [
        {
          id: 7,
          url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500',
          alt: 'Fachada tradicional Ñuñoa',
          isPrimary: true,
          order: 1
        },
        {
          id: 8,
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500',
          alt: 'Área de trabajo especializado',
          isPrimary: false,
          order: 2
        },
        {
          id: 9,
          url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500',
          alt: 'Exposición productos finales',
          isPrimary: false,
          order: 3
        }
      ]
    },
    {
      id: 4,
      name: 'Sede Maipú - Plaza Maipú',
      address: 'Av. Pajaritos 2345, Maipú, Santiago',
      phone: '+56 2 2678 9012',
      hours: 'Lun-Vie: 9:00-18:00, Sáb: 10:00-13:00',
      latitude: -33.5112,
      longitude: -70.7554,
      isActive: true,
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05'),
      photos: [
        {
          id: 10,
          url: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=500',
          alt: 'Fachada sede Maipú',
          isPrimary: true,
          order: 1
        },
        {
          id: 11,
          url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
          alt: 'Sala de espera moderna',
          isPrimary: false,
          order: 2
        }
      ]
    }
  ];

  // Signals para estado global
  private _locations = signal<StoreLocation[]>(this.mockLocations);
  locations = this._locations.asReadonly();

  // ===========================================================================
  // MÉTODOS SIMULADOS - Se reemplazarán con llamadas HTTP reales
  // ===========================================================================

  /**
   * Obtiene todas las ubicaciones (simulado)
   * TODO: Reemplazar con this.http.get<StoreLocation[]>(this.apiUrl)
   */

  getAllLocations(): Observable<StoreLocation[]> {
    //Simular delay de la red
    return of([...this.mockLocations]).pipe(delay(800));
  }

  /**
  * Obtiene una ubicación por ID (simulado)
  * TODO: Reemplazar con this.http.get<StoreLocation>(`${this.apiUrl}/${id}`)
  */

  getLocationById(id: number): Observable<StoreLocation> {
    const location = this.mockLocations.find(location => location.id === id);
    if (!location) {
      throw new Error(`Location id ${id} no encntrado`);
    }
    return of(location).pipe(delay(500));
  }

  /**
 * Crea una nueva ubicación (simulado)
 * TODO: Reemplazar con this.http.post<StoreLocation>(this.apiUrl, locationData)
 */
  createLocation(locationData: CreateLocationRequest): Observable<StoreLocation> {
    const newLocation: StoreLocation = {
      id: Math.max(...this.mockLocations.map(l => l.id)) + 1,
      ...locationData,
      photos: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockLocations.push(newLocation);
    this._locations.set([...this.mockLocations]);

    return of(newLocation).pipe(delay(500));
  }



  /**
   * Actualiza una ubicación (simulado)
   * TODO: Reemplazar con this.http.put<StoreLocation>(`${this.apiUrl}/${updateData.id}`, updateData)
   */

  updateLocation(updateData: UpdateLocationRequest): Observable<StoreLocation> {
    const index = this.mockLocations.findIndex(loc => loc.id === updateData.id);

    if (index === -1) {
      throw new Error(`Location con ID ${updateData.id} no encontrado`);
    }

    const updateLocation: StoreLocation = {
      ...this.mockLocations[index],
      ...updateData,
      updatedAt: new Date()
    };

    this.mockLocations[index] = updateLocation;
    this._locations.set([...this.mockLocations]);

    return of(updateLocation).pipe(delay(1000));
  }


  /**
 * Elimina una ubicación (simulado)
 * TODO: Reemplazar con this.http.delete<void>(`${this.apiUrl}/${id}`)
 */
  deleteLocation(id: number): Observable<void> {
    //verifica si es un ubicacion temprarl ID grande
    const isTemporaryLocation = id > 1000;

    if (isTemporaryLocation) {
      this.removeLocalLocation(id);
      return of(void 0).pipe(delay(500));
    } else {
      const index = this.mockLocations.findIndex(loc => loc.id === id);
      if (index === -1) {
        throw new Error(`Location con ID ${id} no encontrado`);
      }

      this.mockLocations.splice(index, 1)
      this._locations.set([...this.mockLocations]);
      return of(void 0).pipe(delay(1000));
    }
  }

  // ===========================================================================
  // MÉTODOS PARA ACTUALIZACIÓN LOCAL (usados por componentes)
  // ===========================================================================

  /**
   * Actualiza una ubicación en el estado local
   */

  updateLocalLocation(updatedLocation: StoreLocation): void {
    const currentLocations = this._locations();
    const updateLocations = currentLocations.map(loc =>
      loc.id === updatedLocation.id ? updatedLocation : loc
    );

    this._locations.set(updateLocations);
  }

  //Agrega una nueva ubicacíon al estado local
  addLocalLocation(newLocation: StoreLocation): void {
    this._locations.update(locations => [...locations, newLocation]);
  }

  // Elimina una ubicación del estado local
  removeLocalLocation(localId: number): { removedIndex: number; totalRemaining: number } {

    const currentLocations = this._locations();
    const removedIndex = currentLocations.findIndex(loc => loc.id === localId);

    const updatedLocations = currentLocations.filter(loc => loc.id !== localId);

    this._locations.set(updatedLocations);
    return {
      removedIndex,
      totalRemaining: updatedLocations.length
    }
  }

  //Genera un ID único para nuevas fotos
  generatePhotoId(): number {
    const allPhotos = this.mockLocations.flatMap(loc => loc.photos);
    return Math.max(0, ...allPhotos.map(p => p.id)) + 1;
  }

}
