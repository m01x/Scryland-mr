import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HealthResponse } from '@scryland/shared';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: this.configService.get<string>('APP_VERSION') ?? 'unknown',
    };
  }
}
