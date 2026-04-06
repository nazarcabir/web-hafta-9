import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class Rfc7807Filter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Skip for GraphQL (Apollo handles GraphQL errors differently)
    if (!request) return;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any = exception instanceof HttpException 
      ? exception.getResponse() 
      : { message: 'Internal server error' };

    const problemResponse = {
      type: `https://httpstatuses.com/${status}`,
      title: exceptionResponse.error || 'Error',
      status: status,
      detail: Array.isArray(exceptionResponse.message) 
        ? exceptionResponse.message.join(', ') 
        : exceptionResponse.message || exception.message,
      instance: request.url,
    };

    response.status(status).json(problemResponse);
  }
}
