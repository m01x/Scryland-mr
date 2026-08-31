import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

/**
 * Config por defecto de las llamadas a tiendas: `User-Agent` propio y un
 * `timeout` explícito por llamada (reafirma el global del `HttpModule`).
 */
const DEFAULT_CONFIG: AxiosRequestConfig = {
  timeout: 5000,
  headers: { 'User-Agent': 'Scryland/0.0.1' },
};

/**
 * Envoltorio del `HttpService` de `@nestjs/axios`. Expone un GET genérico que
 * devuelve el body de la respuesta, mergeando la config del caller sobre un
 * default de `timeout` + `User-Agent` (los headers se mergean en profundo).
 */
@Injectable()
export class StoreHttpService {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(url, this.mergeConfig(config)),
    );
    return response.data;
  }

  private mergeConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config?.headers,
      },
    };
  }
}
