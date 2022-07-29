import { Component, Input } from '@angular/core';
import { ModalWindowService } from '../../services/modal-window.service'; // TODO: Rework to alias import (Add to tsconfig.ts)
import { BoardService } from '../../services/board.service'; // TODO: Rework to alias import (Add to tsconfig.ts)

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent {
  @Input() task = '';
  @Input() boardIndex = 0;
  @Input() taskIndex = 0;

  constructor(
    private modal: ModalWindowService,
    private boardService: BoardService
  ) {}

  editTask(boardIndex: number, taskIndex: number, task: string): void {
    this.modal.editTaskModal(boardIndex, taskIndex, task);
  }

  deleteTask(boardIndex: number, taskIndex: number) {
    this.boardService.deleteTask(boardIndex, taskIndex);
  }
}
