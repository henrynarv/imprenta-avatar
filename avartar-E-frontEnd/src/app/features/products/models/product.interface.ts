export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number//para mostrar el precio con descuento
  category: ProductCategory;
  images: string[];
  specifications: ProductSpecifications;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  minimumOrder: number;
  has3DModel?: boolean;
  model3D?: {
    gltfUrl: string;                // URL del archivo .gltf/.glb
    defaultColor: string;           // Color por defecto (#b3478c)
    colorableParts: string[];       // Nombres de mallas para colorear
    // initialRotation?: { x: number; y: number; z: number };
    fileSize?: number;              // Tamaño para validación
    format?: 'gltf' | 'glb';        // Formato del modelo
    createdAt?: string
  }
}

export interface ProductSpecifications {
  paperType?: string;
  size?: string;
  color?: string;
  finish?: string;
  deliveryDays?: number;
  weight?: string;
  material?: string;
  printingMethod?: string;
  packaging?: string;
}

export type ProductCategory =
  | 'tarjetas-de-presentacion'
  | 'volantes'
  | 'folletos'
  | 'postales'
  | 'invitaciones'
  | 'sellos'
  | 'papeleria-corporativa'
  | 'impresion-digital'
  | 'gran-formato';


export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  searchText?: string;
  tags?: string[]
  inStock?: boolean;
  isFeatured?: boolean
  sortBy?: 'name' | 'price' | 'rating' | 'newest'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean
}

export interface CartItem {
  productId: number;
  quantity: number;
  specifications?: any
}
