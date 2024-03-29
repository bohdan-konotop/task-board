import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalWindowService } from '@services/modal-window.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BoardService } from '@services/board.service';
import { ModalAction } from '@typescript/enums';
import { Subject } from 'rxjs';
import { DatabaseService } from '@services/database.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  public actions = ModalAction;
  public modal = this.modalService.modalInitial;
  public form = this.fb.group({
    input: ['', [Validators.required, Validators.minLength(1)]],
  });
  private destroy$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private modalService: ModalWindowService,
    private boardService: BoardService,
    private db: DatabaseService
  ) {}

  ngOnInit(): void {
    this.initial();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public action(): void {
    if (this.form.invalid) return;

    switch (this.modal.action) {
      case ModalAction.ADD_PROJECT:
        this.addProject();
        break;
      case ModalAction.ADD:
        this.addTask();
        break;
      case ModalAction.EDIT:
        this.editTask();
        break;
    }

    this.modalService.closeModal();
  }

  public closeModal() {
    this.form.controls.input.reset();
    this.modalService.closeModal();
  }

  private addTask(): void {
    if (this.modal.boardNum === undefined) return;

    this.boardService.addTask(
      this.modal.boardNum,
      this.form.controls.input.value || '',
      this.modal.projectId || 0
    );
  }

  private editTask(): void {
    const boardIndex =
      Number(this.modal.boardNum) + 1 ? this.modal.boardNum : undefined;
    const taskIndex =
      Number(this.modal.taskNum) + 1 ? this.modal.taskNum : undefined;
    const projectId =
      Number(this.modal.projectId) + 1 ? this.modal.projectId : undefined;
    const newName = this.form.value.input || '';

    if (
      boardIndex !== undefined &&
      taskIndex !== undefined &&
      projectId !== undefined
    )
      this.boardService.editTask(boardIndex, taskIndex, newName, projectId);
  }

  private addProject(): void {
    const projectId = this.modal.projectId || null;

    if (projectId === null) return;

    const name = this.form.controls.input.value;

    this.db.setProjectOnServer(projectId, name);
  }

  private initial() {
    this.modalService.modal$.subscribe((modal) => {
      this.modal = modal;
      this.form.controls.input.setValue(modal.editText || '');
    });
  }
}
