import { ReportType } from "./report-type.enum";

//Interfaces para el sistema de reportes
export interface ReportResponse {
  content: ReportItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ReportItem {
  id: number;
  period?: string;           // Para reportes agrupados
  code?: string;            // Para órdenes individuales
  totalOrders?: number;     // Para reportes agrupados
  totalAmount: number;
  status?: string;          // Para órdenes individuales
  email?: string;           // Para órdenes individuales
  createdAt?: string;
}

export interface OrderDetail {
  id: number;
  code: string;
  email: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  customerInfo?: CustomerInfo
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  specifications?: any;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  company?: string;
}

export interface ReportFilters {
  type: ReportType;
  startDate: string;
  endDate: string;
  page: number;
  searchText: string;
  pageSize: number;
}
