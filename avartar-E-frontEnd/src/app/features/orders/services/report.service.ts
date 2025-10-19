import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReportType } from '../models/report-type.enum';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/page-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = 'http://localhost:8080/api/reports';
  private readonly http = inject(HttpClient);

  getTypeReport(type: ReportType, startDate: string,
    endDate: string, page: number = 0,
    searchText?: string, size: number = 0): Observable<PageResponse<any>> {

    let params = new HttpParams()
      .set('type', type)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page)
      .set('size', size);

    if (searchText && searchText.trim().length > 0) {
      params = params.set('searchText', searchText.trim());
    }
    return this.http.get<PageResponse<any>>(`${this.baseUrl}`, { params });

  }


  getOrderDetail(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${orderId}`);
  }

  constructor() { }
}
