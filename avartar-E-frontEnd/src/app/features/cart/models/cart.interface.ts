import { Product } from "../../products/models/product.interface";

export interface CartItem {
  id: string;
  productId: number;
  product: Product;
  quantity: number;
  price: number; // Precio unitario al momento de agregar
  addedAt: Date; // Fecha y hora de agregado al carrito
}

//resumen del carrito y calcula totales, impuestos yd escuentos
export interface CartSummary {
  subtotal: number; //suma de todos los items
  shipping: number; //costo de envio
  discount: number;
  tax: number; //Impuestos calculados
  total: number;  // Total final a pagar
}

//Opciones d eenvio disponibles
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  freeThreshold?: number; // Monto mínimo para envío gratis
}
