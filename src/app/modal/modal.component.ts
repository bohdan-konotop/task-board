import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalWindowService } from '@services/modal-window.service';
import { FormControl, Validators } from '@angular/forms';
import { BoardService } from '@services/board.service';
import { ModalAction } from '@enums';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  public modal = this.modalService.modalInitial;
  public input = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
  ]);
  private destroy$ = new Subject();

  constructor(
    private modalService: ModalWindowService,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    this.initial();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public modalAction(action: ModalAction, taskIndex: number = 0): void {
    if (this.input.invalid || this.modal.boardNum === null) return;

    if (action === ModalAction.ADD) {
      this.boardService.addTask(this.modal.boardNum, this.input.value || '');
      this.closeModal();
      return;
    }

    this.boardService.editTask(
      this.modal.boardNum,
      taskIndex,
      this.input.value || ''
    );
    this.closeModal();
  }

  public closeModal() {
    this.input.reset();
    this.modalService.closeModal();
  }

  private initial() {
    this.modalService.modal$.subscribe((modal) => {
      this.modal = modal;
      this.input.setValue(modal.editText || '');
    });
  }
}
