import { Injectable, signal } from '@angular/core';
import { KPI, Order, OrderStatus, ProductPerformance, SalesData, TopProduct } from '../models/dashboard.interface';
import { delay, Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  //Signals para datos en tiempo real(ficticios)
  private _kpis = signal<KPI[]>([]);
  private _recentOrders = signal<Order[]>([]);
  private _salesData = signal<SalesData[]>([]);
  private _productPerformance = signal<ProductPerformance[]>([]);

  constructor() {
    this.initializeMockData();
  }

  //Inicializa datos de ejemplo para desarrollo
  private initializeMockData(): void {
    // KPI Cards data
    this._kpis.set([
      {
        title: 'Pedidos Hoy',
        value: '18',
        change: '+12%',
        trend: 'up',
        icon: 'heroShoppingBag',
        color: 'blue',
        description: 'Comparado con ayer'
      },
      {
        title: 'Ingresos Mensuales',
        value: '$8.240K',
        change: '+8.2%',
        trend: 'up',
        icon: 'heroCurrencyDollar',
        color: 'green',
        description: 'Este mes'
      },
      {
        title: 'Clientes Nuevos',
        value: '24',
        change: '+15%',
        trend: 'up',
        icon: 'heroUserPlus',
        color: 'purple',
        description: 'Este mes'
      },
      {
        title: 'Tasa de Entrega',
        value: '96.5%',
        change: '+2.1%',
        trend: 'up',
        icon: 'heroTruck',
        color: 'orange',
        description: 'A tiempo'
      },
      {
        title: 'Pedidos Pendientes',
        value: '7',
        change: '-3%',
        trend: 'down',
        icon: 'heroClock',
        color: 'yellow',
        description: 'Por procesar'
      },
      {
        title: 'Satisfacción',
        value: '4.8/5',
        change: '+0.2',
        trend: 'up',
        icon: 'heroStar',
        color: 'indigo',
        description: 'Rating promedio'
      }
    ]);

    // Recent Orders data
    this._recentOrders.set([
      {
        id: 'ORD-001',
        customer: 'TechCorp Solutions',
        product: 'Tarjetas PVC Premium',
        date: '2024-01-15',
        status: 'production',
        amount: 450000,
        priority: 'high'
      },
      {
        id: 'ORD-002',
        customer: 'Restaurant La Familia',
        product: 'Menús Digitales',
        date: '2024-01-15',
        status: 'pending',
        amount: 280000,
        priority: 'medium'
      },
      {
        id: 'ORD-003',
        customer: 'Clinica Dental Sonrisa',
        product: 'Folletos Promocionales',
        date: '2024-01-14',
        status: 'completed',
        amount: 320000,
        priority: 'low'
      },
      {
        id: 'ORD-004',
        customer: 'Universidad Norte',
        product: 'Diplomas y Certificados',
        date: '2024-01-14',
        status: 'delivered',
        amount: 890000,
        priority: 'high'
      },
      {
        id: 'ORD-005',
        customer: 'Farmacia Salud',
        product: 'Etiquetas Medicamentos',
        date: '2024-01-13',
        status: 'production',
        amount: 210000,
        priority: 'medium'
      }
    ]);

    this._salesData.set(this.generateLast7DaysData());
    this._productPerformance.set(this.generateProductPerformance('7d'));
  }

  // Sales Data for charts
  //   this._salesData.set([
  //     { date: 'Ene 01', sales: 1200000, orders: 45 },
  //     { date: 'Ene 02', sales: 1800000, orders: 52 },
  //     { date: 'Ene 03', sales: 1500000, orders: 48 },
  //     { date: 'Ene 04', sales: 2200000, orders: 61 },
  //     { date: 'Ene 05', sales: 1900000, orders: 55 },
  //     { date: 'Ene 06', sales: 2400000, orders: 68 },
  //     { date: 'Ene 07', sales: 2100000, orders: 59 }
  //   ]);

  //   // Product Performance data
  //   this._productPerformance.set([
  //     { name: 'Tarjetas PVC', sales: 2450000, quantity: 320, growth: 12 },
  //     { name: 'Folletos Full Color', sales: 1890000, quantity: 280, growth: 8 },
  //     { name: 'Stickers Adhesivos', sales: 1560000, quantity: 450, growth: 25 },
  //     { name: 'Manuales Técnicos', sales: 1320000, quantity: 85, growth: 5 },
  //     { name: 'Invitaciones', sales: 980000, quantity: 190, growth: 18 }
  //   ]);
  // }





  //Obtine los KPI primcipales del dashboard
  getKPIs(): Observable<KPI[]> {
    return of(this._kpis()).pipe(delay(800));
  }

  //Obtiene los pedidos recientes
  getRecentOrders(): Observable<Order[]> {
    return of(this._recentOrders()).pipe(delay(600));
  }

  //Obtiene los datos de ventas de gráficos
  getSalesData(): Observable<SalesData[]> {
    return of(this._salesData()).pipe(delay(500));
  }

  //Obtiene datos de ventas para graficos de filtros
  getSalesChartData(dateRange: string): Observable<SalesData[]> {
    this._chartLoading.set(true);

    //simular diferentes datos según el rango de fecha
    let data: SalesData[];

    switch (dateRange) {
      case '7d':
        data = this.generateLast7DaysData();
        break;
      case '30d':
        data = this.generateLast30DaysData();
        break;
      case '90d':
        data = this.generateLast90DaysData();
        break;
      default:
        data = this.generateLast7DaysData();
        break;
    }
    return of(data).pipe(delay(600));

  }

  //obtine datos para el gráfico de roductos más vendidos
  getTopProductsData(dateRange: string): Observable<TopProduct[]> {
    const data = this.generateToProductsData(dateRange);
    return of(data).pipe(delay(500));
  }


  //Obtiene datos para el gáfico de estado de pedidos
  getOrdersStatusData(dateRange: string): Observable<OrderStatus[]> {
    const data = this.generateOrdersStatusData(dateRange);
    return of(data).pipe(delay(400));
  }


  //Obtine el rendimiento de productos
  getProductPerformance(dateRangue: string): Observable<ProductPerformance[]> {
    const data = this.generateProductPerformance(dateRangue);
    return of(data).pipe(delay(500));
  }

  //simula actualización en tiempo real de datos
  refreshDashboard(): Observable<boolean> {
    //en una implementacion real , aquí se harina nuevas llamas API
    return of(true).pipe(delay(1000));
  }


  // ==========Metodos auxiliares para generar datos ficticios ======

  private generateToProductsData(dateRange: string): TopProduct[] {
    const baseData = [
      { name: 'Tarjetas PVC', baseSales: 2450000, baseQuantity: 320, basrowth: 12, color: '#3b82f6' },
      { name: 'Folletos Full Color', baseSales: 1890000, baseQuantity: 280, basrowth: 8, color: '#10b981' },
      { name: 'Stickers Adhesivos', baseSales: 1560000, baseQuantity: 450, basrowth: 25, color: '#f59e0b' },
      { name: 'Manuales Técnicos', baseSales: 1320000, baseQuantity: 85, basrowth: 5, color: '#ef4444' },
      { name: 'Invitaciones', baseSales: 980000, baseQuantity: 190, basrowth: 18, color: '#8b5cf6' },
    ];

    const multiplier = dateRange === '7d' ? 0.25 : dateRange === '30d' ? 0.7 : 1;
    return baseData.map(product => ({
      name: product.name,
      sales: Math.round(product.baseSales * multiplier),
      quantity: Math.round(product.baseQuantity * multiplier),
      growth: product.basrowth + (dateRange === '7d' ? 8 : dateRange === '30d' ? 3 : 0),
      color: product.color
    }))
  }

  private generateOrdersStatusData(dateRange: string): OrderStatus[] {
    const baseData = [
      {
        status: 'pending' as const,
        baseCount: 8,
        color: '#f59e0b',
        description: 'Esperando confirmación'
      },
      {
        status: 'production' as const,
        baseCount: 12,
        color: '#3b82f6',
        description: 'En proceso de impresión',
      },
      {
        status: 'completed' as const,
        baseCount: 6,
        color: '#10b981',
        description: 'Listos para entrega',
      },
      {
        status: 'delivered' as const,
        baseCount: 4,
        color: '#8b5cf6',
        description: 'Entregados al cliente',
      }
    ];

    const multiplier = dateRange === '7d' ? 0.8 : dateRange === '30d' ? 1.2 : 1.5;
    return baseData.map(item => ({
      status: item.status,
      count: Math.round(item.baseCount * multiplier),
      color: item.color,
      description: item.description
    }))
  }


  private generateLast7DaysData(): SalesData[] {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    return days.map((day, index) => ({
      date: day,
      sales: 800000 + (Math.random() * 1200000),
      orders: 20 + Math.floor(Math.random() * 30)
    }))
  }


  private generateLast30DaysData(): SalesData[] {
    const data: SalesData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
        sales: 600 + (Math.random() * 1800),
        orders: 15 + Math.floor(Math.random() * 40)
      });
    }
    return data;
  }

  private generateLast90DaysData(): SalesData[] {
    const data: SalesData[] = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (i % 3 === 0) {//mostrar cada 3 dias para no saturar
        data.push({
          date: date.toLocaleDateString('es-Cl', { day: '2-digit', month: 'short' }),
          sales: 500 + (Math.random() * 2000),
          orders: 10 + Math.floor(Math.random() * 50)
        })
      }
    }
    return data;
  }




  private generateProductPerformance(dateRange: string): ProductPerformance[] {
    const baseData = [
      { name: 'Tarjetas PVC', baseSales: 2450000, baseQuantity: 320, baseGrowth: 12 },
      { name: 'Folletos Full Color', baseSales: 1890000, baseQuantity: 280, baseGrowth: 8 },
      { name: 'Stickers Adhesivos', baseSales: 1560000, baseQuantity: 450, baseGrowth: 25 },
      { name: 'Manuales Técnicos', baseSales: 1320000, baseQuantity: 85, baseGrowth: 5 },
      { name: 'Invitaciones', baseSales: 980000, baseQuantity: 190, baseGrowth: 18 }
    ];

    const multiplicar = dateRange === '7d' ? 0.25 : dateRange === '30d' ? 0.7 : 1;

    return baseData.map(product => ({
      name: product.name,
      sales: Math.round(product.baseSales * multiplicar),
      quantity: Math.round(product.baseQuantity * multiplicar),
      growth: product.baseGrowth + (dateRange === '7d' ? 8 : dateRange === '30d' ? 10 : 15)
    }))
  }

  //signal  para loading del grafico (para uso futuro)
  private _chartLoading = signal<boolean>(false);
  chartLoading = this._chartLoading.asReadonly();
}
