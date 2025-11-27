import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPath, heroCalendar, heroChartBar, heroCheck, heroClipboardDocumentList, heroClock, heroCog6Tooth, heroCube, heroCurrencyDollar, heroEye, heroPlus, heroPrinter, heroShoppingBag, heroStar, heroTruck, heroUserPlus } from '@ng-icons/heroicons/outline';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../auth/services/auth.service';
import { KPI, Order, OrderStatus, ProductPerformance, SalesData, TopProduct } from '../../models/dashboard.interface';
import { AlertService } from '../../../../shared/service/alert.service';
import { color } from 'chart.js/helpers';
import { min } from 'rxjs';
import { loadingInterceptor } from '../../../../core/interceptors/loading.interceptor';
import { SalesChartComponent } from "../../components/sales-chart/sales-chart.component";
import { TopProductsChartComponent } from '../../components/top-products-chart/top-products-chart.component';
import { OrderStatusChartComponent } from '../../components/orders-status-chart/orders-status-chart.component';
import { ActiveChartTab } from '../../models/active-chart-tab.type';
import { AuthStateService } from '../../../auth/services/auth-state.service';



@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, NgIcon, SalesChartComponent, TopProductsChartComponent, OrderStatusChartComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  providers: [
    provideIcons({
      heroShoppingBag,
      heroCurrencyDollar,
      heroUserPlus,
      heroTruck,
      heroClock,
      heroStar,
      heroArrowPath,
      heroEye,
      heroCalendar,
      heroChartBar,
      heroPrinter,
      heroCog6Tooth,
      heroPlus,
      heroCheck,
      heroCube,
      heroClipboardDocumentList

    })
  ],
})
export class DashboardPageComponent {

  private alertService = inject(AlertService);
  private dashboardService = inject(DashboardService);
  private authStateService = inject(AuthStateService);

  // Signals para el estado del dashboard
  private _kpis = signal<KPI[]>([]);
  private _recentOrders = signal<Order[]>([]);
  private _salesData = signal<SalesData[]>([]);
  private _topProducts = signal<TopProduct[]>([]);
  private _ordersStatus = signal<OrderStatus[]>([]);
  private _productPerformance = signal<ProductPerformance[]>([]);
  private _isLoading = signal<boolean>(true);
  private _isRefreshing = signal<boolean>(false);
  private _lastUpdated = signal<Date>(new Date());
  private _selectedDateRange = signal<string>('7d');
  private _chartLoading = signal<boolean>(false);
  private _activeChartTab = signal<ActiveChartTab>('sales')

  // Computed properties
  kpis = this._kpis.asReadonly();
  recentOrders = this._recentOrders.asReadonly();
  salesData = this._salesData.asReadonly();
  topProducts = this._topProducts.asReadonly();
  ordersStatus = this._ordersStatus.asReadonly();
  productPerformance = this._productPerformance.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isRefreshing = this._isRefreshing.asReadonly();
  lastUpdated = this._lastUpdated.asReadonly();
  currentUser = this.authStateService.currentUser;
  userRole = this.authStateService.userRole;
  selectedDateRange = this._selectedDateRange.asReadonly();
  activeChartTab = this._activeChartTab.asReadonly();
  chartLoading = this._chartLoading.asReadonly();

  // Interval para actualizaciones automáticas
  private refreshInterval: any;

  /**
   * Inicializa el componente cargando los datos
   */
  ngOnInit(): void {
    this.loadDashboardData();

    // Configurar actualización automática cada 2 minutos
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 120000); // 2 minutos
  }

  /**
   * Carga todos los datos del dashboard
   */
  private loadDashboardData(): void {
    this._isLoading.set(true);

    // Cargar KPIs
    this.dashboardService.getKPIs().subscribe({
      next: (kpis) => {
        this._kpis.set(kpis);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.alertService.error('Error', 'Error al cargar los KPIs.');
        this.checkLoadingComplete();
      }

    });

    // Cargar pedidos recientes
    this.dashboardService.getRecentOrders().subscribe({
      next: (orders) => {
        this._recentOrders.set(orders);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.checkLoadingComplete();
      }
    });

    //Cargar datos de ventas inicaliales
    this.loadAllChartData()
    // this.loadProductPerformance();

    /*



    // Cargar datos de ventas
    this.dashboardService.getSalesData().subscribe({
      next: (salesData) => {
        this._salesData.set(salesData);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading sales data:', error);
        this.checkLoadingComplete();
      }
    });

    // Cargar rendimiento de productos
    this.dashboardService.getProductPerformance().subscribe({
      next: (performance) => {
        this._productPerformance.set(performance);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading product performance:', error);
        this.checkLoadingComplete();
      }
    });

    */
  }

  //Cargar datos del gráfico según el rango seleccionado





  /*

  private loadAllChartData(): void {
    this._chartLoading.set(true);

    this.dashboardService.getSalesChartData(this.selectedDateRange()).subscribe({
      next: (salesData) => {
        this._salesData.set(salesData);
        // this._chartLoading.set(false);
        this.checkChartLoadingComplete();
      },
      error: (error) => {
        console.error('Error, Error al cargar los datos de ventas.:', error);
        this.alertService.error('Error', 'Error al cargar los datos de ventas.');
        // this._chartLoading.set(false);
        this.checkChartLoadingComplete();
      }
    });

    //Cargar datos de productos top
    this.dashboardService.getTopProductsData(this.selectedDateRange()).subscribe({
      next: (products) => {
        this._topProducts.set(products);
        this.checkChartLoadingComplete();
      },
      error: (error) => {
        console.error('Error, Error al cargar los datos de productos top.:', error);
        this.alertService.error('Error', 'Error al cargar los datos de productos top.');
        this.checkChartLoadingComplete();
      }
    });

    //Cargar datos de status de pedidos
    this.dashboardService.getOrdersStatusData(this.selectedDateRange()).subscribe({
      next: (ordersStatus) => {
        this._ordersStatus.set(ordersStatus);
        this.checkChartLoadingComplete();
      },
      error: (error) => {
        console.error('Error, Error al cargar los datos de status de pedidos.:', error);
        this.alertService.error('Error', 'Error al cargar los datos de status de pedidos.');
        this.checkChartLoadingComplete();
      }
    });

  }

*/




  private chartPendingLoads = 0;

  private loadAllChartData(): void {
    this._chartLoading.set(true);
    this.chartPendingLoads = 3; // Tenemos 3 peticiones paralelas

    // Limpiamos los datos antiguos para no mostrar datos anteriores
    this._salesData.set([]);
    this._topProducts.set([]);
    this._ordersStatus.set([]);

    // 📊 Ventas
    this.dashboardService.getSalesChartData(this.selectedDateRange()).subscribe({
      next: (salesData) => {
        this._salesData.set(salesData);
        this.finishChartLoad();
      },
      error: (error) => {
        console.error('Error al cargar datos de ventas:', error);
        this.alertService.error('Error', 'Error al cargar los datos de ventas.');
        this.finishChartLoad();
      }
    });

    // 🛍️ Productos top
    this.dashboardService.getTopProductsData(this.selectedDateRange()).subscribe({
      next: (products) => {
        this._topProducts.set(products);
        this.finishChartLoad();
      },
      error: (error) => {
        console.error('Error al cargar datos de productos top:', error);
        this.alertService.error('Error', 'Error al cargar los datos de productos top.');
        this.finishChartLoad();
      }
    });

    // 📦 Estado de pedidos
    this.dashboardService.getOrdersStatusData(this.selectedDateRange()).subscribe({
      next: (ordersStatus) => {
        this._ordersStatus.set(ordersStatus);
        this.finishChartLoad();
      },
      error: (error) => {
        console.error('Error al cargar estado de pedidos:', error);
        this.alertService.error('Error', 'Error al cargar los datos de estado de pedidos.');
        this.finishChartLoad();
      }
    });
  }

  /**
   * Marca una carga como completada y desactiva el loading
   * cuando todas han terminado.
   */
  private finishChartLoad(): void {
    this.chartPendingLoads--;

    if (this.chartPendingLoads <= 0) {
      this._chartLoading.set(false);
      this._lastUpdated.set(new Date());
    }
  }






  //Verifica si todos los datos de gráficos han sido cargados
  private checkChartLoadingComplete(): void {
    if (this.salesData().length > 0 &&
      this.topProducts().length > 0 &&
      this.ordersStatus().length > 0) {
      this._chartLoading.set(false);
    }
  }




  //Cargar datos de rendimineto de productos
  private loadProductPerformance(): void {
    this.dashboardService.getProductPerformance(this.selectedDateRange()).subscribe({
      next: (performance) => {
        this._productPerformance.set(performance);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.log('error al cargar los datos de rendimiento de productos:', error);
        this.alertService.error('Error', 'Error al cargar los datos de rendimiento de productos.');
        this.checkLoadingComplete()
      }

    })
  }


  /**
   * Verifica si todos los datos han sido cargados
   */
  private checkLoadingComplete(): void {
    if (this.kpis() &&
      this.recentOrders() &&
      this.salesData() &&
      this.productPerformance()) {
      this._isLoading.set(false);
      this._lastUpdated.set(new Date());
    }
  }

  //Maneja el camnio de pestaña
  onChartTabChange(tab: ActiveChartTab): void {
    this._activeChartTab.set(tab);
  }



  //Maneja del cambio de rango de fecha en el gráfico
  onDateRangeChange(newRange: string): void {
    this._selectedDateRange.set(newRange);
    this.loadAllChartData();
    // this.loadProductPerformance();

  }


  /**
   * Actualiza los datos del dashboard manualmente
   */
  refreshData(): void {
    this._isRefreshing.set(true);

    this.dashboardService.refreshDashboard().subscribe({
      next: (success) => {
        if (success) {
          this.loadDashboardData();
          this._lastUpdated.set(new Date());
        }
        this._isRefreshing.set(false);
      },
      error: (error) => {
        console.error('Error refreshing dashboard:', error);
        this._isRefreshing.set(false);
      }
    });
  }

  //Obtiene las classes CSS para las pestañas
  getTabClasses(tab: ActiveChartTab): string {
    const baseClasses = 'flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 '

    if (this.activeChartTab() === tab) {
      return baseClasses + 'bg-blue-600 text-white shadowlg';
    }

    return baseClasses + 'bg-gray-600 hover:text-gray-900 hover:bg-gray-100';
  }



  //Obtiene las clases CSS para las tarjetas KPI

  getKPICardClasses(kpi: KPI): string {
    const baseClasses = 'rounded-2xl p-6 shadow-sm border transition-all duration-300 transform hover:scale-105 ';

    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
      yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
      indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
    };

    return baseClasses + (colorClasses[kpi.color as keyof typeof colorClasses] || colorClasses.blue);
  }

  /**
   * Obtiene las clases CSS para los iconos KPI
   */
  getKPIIconClasses(kpi: KPI): string {
    const baseClasses = 'w-12 h-12 rounded-xl flex items-center justify-center ';

    const colorClasses = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      indigo: 'bg-indigo-500 text-white'
    };

    return baseClasses + (colorClasses[kpi.color as keyof typeof colorClasses] || colorClasses.blue);
  }

  /**
   * Obtiene las clases CSS para los badges de estado de pedidos
   */
  getOrderStatusClasses(status: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium ';

    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      production: 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      delivered: 'bg-purple-100 text-purple-800 border border-purple-200'
    };

    return baseClasses + (statusClasses[status as keyof typeof statusClasses] || statusClasses.pending);
  }

  /**
   * Obtiene las clases CSS para los badges de prioridad
   */
  getPriorityClasses(priority: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium ';

    const priorityClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };

    return baseClasses + (priorityClasses[priority as keyof typeof priorityClasses] || priorityClasses.low);
  }

  /**
   * Formatea moneda en pesos chilenos
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * TrackBy function para optimización de rendimiento
   */
  trackByKpiTitle(index: number, kpi: KPI): string {
    return kpi.title;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  trackByProductName(index: number, product: ProductPerformance): string {
    return product.name;
  }

  /**
   * Limpia el intervalo al destruir el componente
   */
  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
