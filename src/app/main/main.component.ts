import { Component, OnInit } from '@angular/core';
import { BoardService } from '../services/board.service';
import { Board } from '../interfaces';
import { ModalWindowService } from '../services/modal-window.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  boards: Board[] = this.boardService.boardsInitial;
  dragStartElement: HTMLDivElement | null = null;

  constructor(
    private boardService: BoardService,
    private modal: ModalWindowService
  ) {}

  ngOnInit(): void {
    this.boardService.boards$.subscribe((boards) => (this.boards = boards));
  }

  addTask(boardIndex: number): void {
    this.modal.addTaskModal(boardIndex);
  }

  editTask(boardIndex: number, taskIndex: number, task: string): void {
    this.modal.editTaskModal(boardIndex, taskIndex, task);
  }

  dragStart(event: Event) {
    this.dragStartElement = event.currentTarget as HTMLDivElement;
    (event.currentTarget as HTMLDivElement).style.opacity = '.4';
  }

  dragEnd(event: Event) {
    (event.currentTarget as HTMLDivElement).removeAttribute('style');
    //console.log(event.currentTarget);
  }

  dragEnter(event: Event) {
    //console.log((event.currentTarget as HTMLDivElement).parentElement);
    const parent = (event.currentTarget as HTMLDivElement).parentElement;

    if (parent === null) return;

    parent.style.outline = '3px dashed blue';
    parent.append(this.dragStartElement as HTMLDivElement);
  }

  dragLeave(event: Event) {
    const parent = (event.currentTarget as HTMLDivElement).parentElement;

    if (parent === null) return;
    parent.removeAttribute('style');
  }
}
