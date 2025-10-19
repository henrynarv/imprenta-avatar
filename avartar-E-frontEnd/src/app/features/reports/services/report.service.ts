import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OrderDetail, ReportResponse } from '../models/report.interface';
import { delay, Observable, of } from 'rxjs';
import { ReportType } from '../models/report-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private http = inject(HttpClient);

  //Obtiene reportes según el tipo y filtros
  //Reemplazar con llamadas reales a la API
  getTypeReport(
    type: ReportType,
    startDate: string,
    endDate: string,
    page: number = 0,
    searchText: string = '',
    pageSize: number = 10
  ): Observable<ReportResponse> {
    // Simulación de API call - Reemplazar con HTTP real
    return this._mockGetTypeReport(type, startDate, endDate, page, searchText, pageSize);
  }

  //Obtiene el detalle de una orden específica
  getOrderDetail(orderId: number): Observable<OrderDetail> {
    // Simulación de API call - Reemplazar con HTTP real
    return this._mockGetOrderDetail(orderId);
  }

  /*
   ==========================================================================
     MÉTODOS DE SIMULACIÓN - REEMPLAZAR CON LLAMADAS REALES A LA API
   ==========================================================================
  */

  private _mockGetTypeReport(
    type: ReportType,
    startDate: string,
    endDate: string,
    page: number = 0,
    searchText: string = '',
    pageSize: number
  ): Observable<ReportResponse> {
    //simulr delay de la red
    return of(this._generateMockReportData(type, page, pageSize, searchText)).pipe(delay(800));
  }

  private _mockGetOrderDetail(orderId: number): Observable<OrderDetail> {
    //simular datos mock de orden
    const mockOrder: OrderDetail = {
      id: orderId,
      code: `ORD-${orderId.toString().padStart(6, '0')}`,
      email: `cliente${orderId}@empresa.cl`,
      status: 'PENDING',
      totalAmount: 125000,
      createdAt: new Date().toISOString(),
      customerInfo: {
        name: 'Maria conzales',
        phone: '123456789+56 9 8765 4321',
        address: 'Calle 123, Santiago, Chile',
        company: 'Imprenta Avatar '
      },
      items: [
        {
          id: 1,
          productName: 'Tarjetas de Presentacion Premium',
          quantity: 500,
          price: 25000,
          subtotal: 125000,
          specifications: {
            paperType: 'Cartulina premiun 300gr',
            size: '8.5x 5.5 cm',
            color: 'Full Color'
          }
        }
      ]
    };
    return of(mockOrder).pipe(
      delay(500)
    );
  }



  private _generateMockReportData(
    type: ReportType,
    page: number,
    pageSize: number,
    searchText: string
  ): ReportResponse {
    const totalElements = type === ReportType.ALL ? 45 : 12;
    const totalPages = Math.ceil(totalElements / pageSize);

    const content = Array.from({ length: pageSize }, (_, index) => {
      const globalIndex = page * pageSize + index + 1;

      if (type === ReportType.ALL) {
        // Datos para vista de todas las órdenes
        return {
          id: globalIndex,
          code: `ORD-${globalIndex.toString().padStart(6, '0')}`,
          totalAmount: 50000 + (globalIndex * 2500),
          status: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'][globalIndex % 4],
          email: `cliente${globalIndex}@empresa.cl`,
          createdAt: new Date(Date.now() - globalIndex * 86400000).toISOString()
        };
      } else {
        // Datos para reportes agrupados
        const periods = {
          [ReportType.DAILY]: `2024-01-${(15 + globalIndex).toString().padStart(2, '0')}`,
          [ReportType.WEEKLY]: `Semana ${globalIndex}`,
          [ReportType.MONTHLY]: `2024-${globalIndex.toString().padStart(2, '0')}`,
          [ReportType.YEARLY]: `202${globalIndex % 4}`
        };

        return {
          id: globalIndex,
          period: periods[type],
          totalOrders: 10 + (globalIndex * 2),
          totalAmount: 100000 + (globalIndex * 50000)
        };
      }
    });

    // Aplicar filtro de búsqueda si existe
    const filteredContent = searchText
      ? content.filter(item =>
        item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase())
      )
      : content;

    return {
      content: filteredContent,
      totalPages,
      totalElements: filteredContent.length,
      number: page,
      size: pageSize,
      first: page === 0,
      last: page >= totalPages - 1
    };
  }
}
