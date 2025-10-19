export interface StoreLocation {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  photos: StorePhoto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorePhoto {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  file?: File; //para uploads
}


export interface CreateLocationRequest {
  name: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
}

export interface UpdateLocationRequest extends Partial<CreateLocationRequest> {
  id: number
}
