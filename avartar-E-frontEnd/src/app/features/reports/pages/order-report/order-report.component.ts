import { Component, effect, inject, signal } from '@angular/core';
import { ReportService } from '../../services/report.service';
import { ReportType, ReportTypeLabels } from '../../models/report-type.enum';
import { OrderDetail } from '../../models/report.interface';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/service/alert.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-order-report',
  imports: [CommonModule, FormsModule, CurrencyPipe, OrderDetailModalComponent],
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss'
})
export class OrderReportComponent {

  // codigo de pruueba
  authService = inject(AuthService);
  // codigo de pruueba


  public ReportType = ReportType;

  private readonly reportService = inject(ReportService);
  private readonly alertService = inject(AlertService);

  //constantes
  readonly reportTypes = Object.values(ReportType);
  readonly reportTypeLabels = ReportTypeLabels;

  //Signals para el estado reactivo;
  selectedReportType = signal(ReportType.ALL);
  startDate = signal<string>(this.getDefaultStartDate());
  endDate = signal<string>(new Date().toISOString().split('T')[0]);


  reports = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  selectedOrder = signal<OrderDetail | null>(null);
  isModalOpen = signal<boolean>(false);
  loading = signal<boolean>(false);
  searchText = signal<string>('');

  // Subject para debounce de búsqueda
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.loadReports();

    //configurar debounde para busqueda
    this.setupSearchDebounce();

    //Effectos reactivos para camnios en filtros
    this.setupReactiveEffects();
  }

  private setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    )
      .subscribe(() => {
        this.loadReports(0);
      })
  }

  //Configura efectos reactivos para cambios en filtros
  private setupReactiveEffects(): void {
    //Efecto para cambios en tipo de reporte, fechas y búsqueda
    effect(() => {
      const type = this.selectedReportType();
      const start = this.startDate();
      const end = this.endDate();
      const search = this.searchText();

      //Reinicia a pagina 0 cunado cambia los filtros
      this.loadReports(0);
    });
  }

  //cargar reportes desde el servicio
  loadReports(page: number = 0): void {
    this.loading.set(true);

    this.reportService.getTypeReport(
      this.selectedReportType(),
      this.startDate(),
      this.endDate(),
      page,
      this.searchText(),
      this.pageSize()
    ).subscribe({
      next: (response) => {
        this.reports.set(response.content);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.number);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading.set(false);
        this.alertService.error(
          'Error',
          'No se pudo completar la operación. Inténtalo nuevamente.'
        );
      }
    })
  }

  //Maneja el cambio de página
  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.loadReports(newPage);
    }
  }


  //Abre el modal con el detalle de la orden
  viewOrderDetail(ordeId: number): void {
    this.loading.set(true);

    this.reportService.getOrderDetail(ordeId).subscribe({
      next: (detail) => {
        this.selectedOrder.set(detail);
        this.isModalOpen.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading.set(false);
        this.alertService.error(
          'Error',
          'No se pudo completar la operación. Inténtalo nuevamente.'
        );
      }
    })
  }

  //Cierra el modal
  closeOrderDetail(): void {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  //Obtiene el texto para la columna de periodo/orden
  getDisplayText(item: any): string {
    if (this.selectedReportType() === ReportType.ALL) {
      return item.code || 'N/A';
    }
    return item.period || 'N/A';
  }

  //Obtiene el texto para la columna de total/estado
  getSecondaryText(item: any): string {
    if (this.selectedReportType() === ReportType.ALL) {
      return this.formatStatus(item.status);
    }
    return `${item.totalOrders} órdenes`;
  }


  //Formatea el estado para mostrar
  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PROCESSING': 'En Proceso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }


  // Obtiene las  classes Css para el estado
  getStatusClasses(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800 ',
      'PROCESSING': 'bg-blue-100 text-blue-800 ',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }


  //TrackBy function para optimizar rendimiento
  trackByReportId(index: number, item: any): number {
    return item.id;
  }
  //Obtiene la fecha de incio por defecto(hace 30 dias)
  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }



  //Limpia las subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
