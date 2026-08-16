import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './health/health.module';

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
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
