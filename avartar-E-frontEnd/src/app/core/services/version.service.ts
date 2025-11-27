import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  private http = inject(HttpClient);

  getVersion(): Observable<{ version: string }> {
    return this.http.get<{ version: string }>('/assets/version.json')
  }


}
