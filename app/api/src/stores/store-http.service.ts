import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

/**
 * Envoltorio del `HttpService` de `@nestjs/axios`. Expone un GET genérico que
 * devuelve el body de la respuesta. No tiene URLs de tiendas ni se invoca
 * contra ellas: es solo la infraestructura de consulta para specs futuras.
 */
@Injectable()
export class StoreHttpService {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(this.httpService.get<T>(url, config));
    return response.data;
  }
}
