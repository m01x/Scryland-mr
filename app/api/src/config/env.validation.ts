import * as Joi from 'joi';

/**
 * Schema de validación del entorno. La aplicación no arranca si `PORT` o
 * `APP_VERSION` faltan o son inválidos (`ConfigModule` aborta el bootstrap).
 */
export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().positive().required(),
  APP_VERSION: Joi.string().required(),
});
