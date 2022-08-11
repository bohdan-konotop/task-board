import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board.component';
import { TaskComponent } from './task/task.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderModule } from '../../modules/header/header.module';

const routes: Routes = [{ path: ':boardId', component: BoardComponent }];

@NgModule({
  declarations: [BoardComponent, TaskComponent],
  exports: [BoardComponent],
  imports: [CommonModule, HeaderModule, RouterModule.forChild(routes)],
})
export class BoardModule {}
