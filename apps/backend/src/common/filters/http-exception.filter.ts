import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface PostgresDatabaseError extends Error {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Ha ocurrido un error interno en el servidor.';
    let errorType = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (resObj.message) {
          message = resObj.message as string | string[];
        }
        if (resObj.error) {
          errorType = resObj.error as string;
        }
      }
      errorType = errorType || exception.name;
    } else if (this.isPostgresError(exception)) {
      const pgErr = exception as PostgresDatabaseError;
      switch (pgErr.code) {
        case '23505': // unique_violation
          statusCode = HttpStatus.CONFLICT;
          errorType = 'Conflict';
          message = 'El registro especificado ya existe o presenta un conflicto de unicidad.';
          break;
        case '23503': // foreign_key_violation
          statusCode = HttpStatus.BAD_REQUEST;
          errorType = 'Bad Request';
          message = 'La entidad relacionada especificada no existe o no es válida.';
          break;
        case '22P02': // invalid_text_representation (e.g. malformed UUID)
          statusCode = HttpStatus.BAD_REQUEST;
          errorType = 'Bad Request';
          message = 'Identificador o formato de datos no válido.';
          break;
        default:
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          errorType = 'Database Error';
          message = 'Error en la base de datos al procesar la solicitud.';
          this.logger.error(`Postgres Error (${pgErr.code}): ${pgErr.message}`, pgErr.stack);
          break;
      }
    } else {
      const err = exception as Error;
      this.logger.error(
        `Unhandled Exception on ${request.method} ${request.url}: ${err?.message || exception}`,
        err?.stack,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isPostgresError(exception: unknown): exception is PostgresDatabaseError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as PostgresDatabaseError).code === 'string'
    );
  }
}
