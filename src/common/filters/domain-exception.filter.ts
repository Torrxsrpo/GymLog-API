import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { DomainConflictError, DomainValidationError, ResourceNotFoundError } from '../errors/domain-errors.js';

const DOMAIN_ERRORS: Record<string, HttpStatus> = {
  EmailException: HttpStatus.BAD_REQUEST,
  PasswordLengthException: HttpStatus.BAD_REQUEST,
  PasswordFormatException: HttpStatus.BAD_REQUEST,
  InvalidCredentialsException: HttpStatus.UNAUTHORIZED,
};

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const status = this.statusFor(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }

  private statusFor(exception: Error): HttpStatus {
    if (exception instanceof ResourceNotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof DomainValidationError) return HttpStatus.BAD_REQUEST;
    if (exception instanceof DomainConflictError) return HttpStatus.CONFLICT;
    return DOMAIN_ERRORS[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
