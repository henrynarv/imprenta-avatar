import { color } from 'chart.js/helpers';
//interfaces para los datos del dasboard
export interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
  description: string;
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: 'pending' | 'production' | 'completed' | 'delivered';
  amount: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
  quantity: number;
  growth: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
  growth: number;
  color: string;
}

export interface OrderStatus {
  status: 'pending' | 'production' | 'completed' | 'delivered';
  count: number;
  color: string;
  description: string;
}
