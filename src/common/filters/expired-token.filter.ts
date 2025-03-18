import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { Response } from 'express';

@Catch(TokenExpiredError)
export class ExpiredTokenFilter implements ExceptionFilter {
  catch(exception: TokenExpiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.GONE).json({
      statusCode: HttpStatus.GONE,
      message: 'Access token has expired',
    });
  }
}
