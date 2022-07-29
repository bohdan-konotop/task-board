import { Component, OnInit } from '@angular/core';
import { ModalWindowService } from '../services/modal-window.service';
import { FormControl, Validators } from '@angular/forms';
import { BoardService } from '../services/board.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  modal = this.modalService.modalInitial;
  input = new FormControl('', [Validators.required, Validators.minLength(1)]);

  constructor(
    private modalService: ModalWindowService,
    private boardService: BoardService
  ) {}

  ngOnInit() {
    // TODO: add destroy$ Subject
    this.modalService.modal$.subscribe((modal) => {
      this.modal = modal;
      this.input.setValue(modal.editText || '');
    });
  }

    // TODO: add enums for strings
  modalAction(action: 'Add' | 'Edit' | null, taskIndex: number = 0): void {
    if (this.input.invalid || this.modal.boardNum === null) return;

    if (action === 'Add') {
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

  closeModal() {
    this.input.reset();
    this.modalService.closeModal();
  }
}
