import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UrlInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (/(^http:|https:)/.test(req.url)) return next.handle(req);

    const URL = 'http://localhost:3000';

    const httpsReq = req.clone({
      url: URL + req.url,
    });

    return next.handle(httpsReq);
  }
}
