import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Modal } from '@interfaces';
import { ModalAction } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  public modalInitial: Modal = {
    show: false,
    action: ModalAction.ADD,
    boardNum: null,
  };

  private modal = new BehaviorSubject<Modal>(this.modalInitial);
  public modal$ = this.modal.asObservable();

  public addTaskModal(boardNum: number | null): void {
    this.modal.next({ show: true, action: ModalAction.ADD, boardNum });
  }

  public editTaskModal(
    boardNum: number | null,
    taskNum: number,
    editText: string
  ): void {
    if (boardNum === null) return;
    this.modal.next({
      show: true,
      action: ModalAction.EDIT,
      boardNum,
      taskNum,
      editText,
    });
  }

  public closeModal(): void {
    this.modal.next(this.modalInitial);
  }
}
