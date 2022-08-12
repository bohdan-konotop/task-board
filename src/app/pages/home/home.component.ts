import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseService } from '@services/database.service';
import { ColumnServer } from '@typescript/interfaces';
import { ModalWindowService } from '@services/modal-window.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public boards = this.db.getBoards();
  public columns: ColumnServer[] = [];

  private destroy$ = new Subject();

  constructor(private db: DatabaseService, private modal: ModalWindowService) {}

  ngOnInit(): void {
    this.initialization();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addProject(): void {
    const projectId = this.columns.length;

    this.modal.addProject(projectId);
  }

  private initialization() {
    this.db
      .getColumns()
      .pipe(takeUntil(this.destroy$))
      .subscribe((columns) => (this.columns = columns));
  }
}
