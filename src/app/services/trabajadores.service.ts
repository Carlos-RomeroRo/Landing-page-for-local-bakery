import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import { Trabajador } from '../models/trabajador.model';

@Injectable({ providedIn: 'root' })
export class TrabajadoresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/trabajadores`;

  listar(): Observable<Trabajador[]> {
    return this.http.get<Trabajador[]>(this.baseUrl);
  }
}
