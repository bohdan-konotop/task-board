import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '@services/database.service';
import { ColumnServer } from '@typescript/interfaces';
import { ModalWindowService } from '@services/modal-window.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  boards = this.db.boards;
  columns: ColumnServer[] = [];

  constructor(private db: DatabaseService, private modal: ModalWindowService) {}

  ngOnInit(): void {
    this.initialization();
  }

  public addProject(): void {
    const projectId = this.columns.length;

    this.modal.addProject(projectId);
  }

  private initialization() {
    this.db.columns.subscribe((columns) => (this.columns = columns));
  }
}
