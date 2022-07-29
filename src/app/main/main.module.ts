import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { TaskComponent } from './task/task.component';

@NgModule({
  declarations: [MainComponent, TaskComponent],
  exports: [MainComponent],
  imports: [CommonModule],
})
export class MainModule {}
