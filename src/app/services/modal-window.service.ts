import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Modal } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  modalInitial = { show: false, activity: null, boardNum: null };

  private modal = new BehaviorSubject<Modal>(this.modalInitial);
  modal$ = this.modal.asObservable();

  addTaskModal(boardNum: number | null): void {
    this.modal.next({ show: true, activity: 'Add', boardNum });
  }

  editTaskModal(
    boardNum: number | null,
    taskNum: number,
    editText: string
  ): void {
    if (boardNum === null) return;
    this.modal.next({
      show: true,
      activity: 'Edit',
      boardNum,
      taskNum,
      editText,
    });
  }

  closeModal(): void {
    this.modal.next(this.modalInitial);
  }
}
