import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Kiểm tra nếu là UnauthorizedException
    if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Bạn không có quyền truy cập.';
    }

    // Kiểm tra nếu là HttpException (bao gồm ValidationPipe)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (Array.isArray(exceptionResponse['message'])) {
        // Nếu là mảng, ghép các thông báo lỗi thành chuỗi
        message = exceptionResponse['message'].join(', ');
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = exceptionResponse['message'] || 'Unknown error';
      }
    } else {
      // Nếu là ngoại lệ không xác định, log ra để tìm hiểu thêm
      console.error('Unhandled exception:', exception);
    }

    // Đảm bảo chỉ gửi một phản hồi duy nhất
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message: message,
      });
    }
  }
}
