import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { SearchModule } from './search/search.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Fuente explícita del `.env` de la raíz del monorepo. Resuelto desde
      // `__dirname` (no desde `cwd`): `app/api/src` en dev y `app/api/dist` en
      // prod están ambos a 3 niveles de la raíz.
      envFilePath: path.resolve(__dirname, '../../../.env'),
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
    // Cliente HTTP compartido por los módulos de tiendas. `global: true`
    // evita registrar una segunda instancia (sin el timeout) al importarlo
    // dentro de `StoresModule`; así `StoreHttpService` inyecta el `HttpService`
    // ya configurado. Todavía no hay llamadas reales a tiendas.
    HttpModule.register({
      timeout: 5000,
      global: true,
    }),
    HealthModule,
    StoresModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
