import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalWindowService } from '@services/modal-window.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BoardService } from '@services/board.service';
import { ModalAction } from '@typescript/enums';
import { Subject, takeUntil } from 'rxjs';
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
    this.initialization();
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
    const boardIndex = this.modal.boardNum;
    const taskIndex = this.modal.taskNum;
    const projectId = this.modal.projectId;
    const newName = this.form.value.input || '';

    if (!!boardIndex && !!taskIndex && !!projectId)
      this.boardService.editTask(boardIndex, taskIndex, newName, projectId);
  }

  private addProject(): void {
    const projectId = this.modal.projectId || null;

    if (projectId === null) return;

    const name = this.form.controls.input.value;

    this.db.setProjectOnServer(projectId, name);
  }

  private initialization() {
    this.modalService.modal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((modal) => {
        this.modal = modal;
        this.form.controls.input.setValue(modal.editText || '');
      });
  }
}
