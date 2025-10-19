import { Component, effect, inject, signal } from '@angular/core';
import { ReportType } from '../../models/report-type.enum';
import { ReportService } from '../../services/report.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-order-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss'
})
export class OrderReportComponent {

  private readonly reportService = inject(ReportService);

  reportTypes = Object.values(ReportType);

  // estado reactivo con señales
  selectedReportType = signal<ReportType>(ReportType.DAILY);
  startDate = signal<string>(new Date().toISOString().split('T')[0]);
  endDate = signal<string>(new Date().toISOString().split('T')[0]);

  // reports: any[] = [];
  reports = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10)

  selectedOrder = signal<any | null>(null);
  loading = signal<boolean>(false);
  searchText = signal<string>('');

  //Subject de RxJs para debounce;
  private searchSubject = new Subject<string>();

  constructor() {
    this.loadReports();

    //efecto reactivi para el debounde de busqueda
    //cada vez que search cambia , emitimos un valor al subject
    effect(() => {
      this.searchSubject.next(this.searchText());
    })

    //debounce usando RXJs
    this.searchSubject
      .pipe(
        debounceTime(400)
      )
      .subscribe(() => {
        this.loadReports(0);
      });

    //Efecto reactivo para cambios de fechas o tipos de reporte
    effect(() => {
      const type = this.selectedReportType();
      const start = this.startDate();
      const end = this.endDate();

      this.loadReports(0);
    })
  }


  loadReports(page: number = 0) {
    this.loading.set(true);
    this.reportService.getTypeReport(this.selectedReportType(), this.startDate(), this.endDate(), page, this.searchText(), this.pageSize())
      .subscribe({
        next: (res) => {
          this.reports.set(res.content);
          this.totalPages.set(res.totalPages)
          this.currentPage.set(res.number);
          this.loading.set(false);
        },
        error: () => (this.loading.set(false))
      });
  }

  viewOrderDetail(orderId: number) {
    this.reportService.getOrderDetail(orderId)
      .subscribe({
        next: (detail) => {
          this.selectedOrder = detail;
        },
        error: () => {
          this.selectedOrder.set(false);
        }
      });
  }

  closeOrderDetail() {
    this.selectedOrder.set(null);
  }
}
