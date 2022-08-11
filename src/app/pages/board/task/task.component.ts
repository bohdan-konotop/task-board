import { Component, Input } from '@angular/core';
import { ModalWindowService } from '@services/modal-window.service';
import { BoardService } from '@services/board.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent {
  @Input() public task = '';
  @Input() public boardIndex = 0;
  @Input() public taskIndex = 0;
  @Input() public projectId: number = 0;

  constructor(
    private modal: ModalWindowService,
    private boardService: BoardService
  ) {}

  public editTask(
    boardIndex: number,
    taskIndex: number,
    task: string,
    projectId: number
  ): void {
    this.modal.editTaskModal(boardIndex, taskIndex, task, projectId);
  }

  public deleteTask(
    boardIndex: number,
    taskIndex: number,
    projectId: number
  ): void {
    this.boardService.deleteTask(boardIndex, taskIndex, projectId);
  }
}
