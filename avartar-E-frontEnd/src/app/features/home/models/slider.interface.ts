export interface SliderImage {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fileSize?: number; // Para imágenes locales
  fileName?: string; // Para imágenes locales
}

export interface SliderImageCreate {
  name: string;
  alText: string;
  order: number;
  isActive: boolean;
}

export interface SliderImageUpdate {
  name?: string;
  alText?: string;
  order?: number;
  isActive?: boolean;
}
