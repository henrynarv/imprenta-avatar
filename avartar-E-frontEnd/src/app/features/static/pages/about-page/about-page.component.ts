import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { SalesChartComponent } from "../../../dashboard/components/sales-chart/sales-chart.component";
import { StoreMapComponent } from "../../../store-locations/components/store-map/store-map.component";
import { LocationListComponent } from "../../../store-locations/components/location-list/location-list.component";
import { PhotoGalleryComponent } from "../../../store-locations/components/photo-gallery/photo-gallery.component";
import { StoreLocation, StorePhoto } from '../../../store-locations/models/location.interface';
import { AdminLocationsPageComponent } from "../../../store-locations/pages/admin-locations-page/admin-locations-page.component";
import { StoreLocationsPageComponent } from "../../../store-locations/pages/store-locations-page/store-locations-page.component";
interface GalleryImage {
  id: string;
  title: string;
  alt: string;
  thumb: string;
  full: string;
}

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface Location {
  id: number;
  name: string;
  photos: Photo[];
}

// export interface StoreLocation {
//   id: number;
//   name: string;
//   address: string;
//   phone: string;
//   hours: string;
//   latitude: number;
//   longitude: number;
//   alt: string;
//   photos: Photo[];
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

@Component({
  selector: 'app-about-page',
  imports: [AdminLocationsPageComponent, StoreLocationsPageComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {


}
