import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Modal } from '@typescript/interfaces';
import { ModalAction } from '@typescript/enums';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  public modalInitial: Modal = {
    show: false,
    action: ModalAction.ADD,
  };

  private modal = new BehaviorSubject<Modal>(this.modalInitial);
  public modal$ = this.modal.asObservable();

  public addTaskModal(boardNum: number | undefined, projectId: number): void {
    this.modal.next({
      show: true,
      action: ModalAction.ADD,
      boardNum,
      projectId,
    });
  }

  public editTaskModal(
    boardNum: number,
    taskNum: number,
    editText: string,
    projectId: number
  ): void {
    this.modal.next({
      show: true,
      action: ModalAction.EDIT,
      boardNum,
      taskNum,
      editText,
      projectId,
    });
  }

  public addProject(projectId: number) {
    this.modal.next({
      show: true,
      action: ModalAction.ADD_PROJECT,
      projectId,
    });
  }

  public closeModal(): void {
    this.modal.next(this.modalInitial);
  }
}
