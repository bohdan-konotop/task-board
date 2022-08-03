import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MainModule } from './main/main.module';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [AppComponent, ModalComponent],
  imports: [BrowserModule, MainModule, ReactiveFormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
