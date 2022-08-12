import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable()
export class ErrorsInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<HttpErrorResponse>,
    next: HttpHandler
  ): Observable<HttpEvent<HttpErrorResponse>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log('Error message: ', err.message);
        console.log('Retrying to load data..');
        return throwError(() => err);
      }),
      retry({ count: 5, delay: 1000 })
    );
  }
}
