import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MainModule } from './main/main.module';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [AppComponent, ModalComponent],
  imports: [BrowserModule, MainModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
