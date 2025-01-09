import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - Request received`,
    );

    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `[${new Date().toISOString()}] ${method} ${url} - Response sent in ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
