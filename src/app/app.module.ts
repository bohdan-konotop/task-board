import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BoardModule } from './pages/board/board.module';
import { ModalComponent } from './components/modal/modal.component';
import { HomeModule } from './pages/home/home.module';
import { UrlInterceptor } from './interceptors/url.interceptor';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';

const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'board',
    loadChildren: () =>
      import('./pages/board/board.module').then((m) => m.BoardModule),
  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  declarations: [AppComponent, ModalComponent],
  imports: [
    BrowserModule,
    HomeModule,
    BoardModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorsInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
