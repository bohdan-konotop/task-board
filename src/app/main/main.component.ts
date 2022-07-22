import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BoardService } from '../services/board.service';
import { Board, IndexesData } from '../interfaces';
import { ModalWindowService } from '../services/modal-window.service';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewInit {
  boards: Board[] = this.boardService.boardsInitial;
  private childrenList: NodeListOf<Element> = document.querySelectorAll(
    '.board-task__wrapper'
  );
  private dragStartEvents$: Array<Observable<DragEvent>> = [];
  private dragEndEvents$: Array<Observable<DragEvent>> = [];
  private dragEnterEvents$: Array<Observable<DragEvent>> = [];
  private subscription = new Subscription();
  private dragStartDiv: HTMLDivElement = this.childrenList[0] as HTMLDivElement;
  private dragEndDiv: HTMLDivElement = this.childrenList[0] as HTMLDivElement;
  private offset: number = 0;
  private blockHeight: number = 0;

  constructor(
    private boardService: BoardService,
    private modal: ModalWindowService
  ) {}

  ngOnInit(): void {
    this.boardService.boards$.subscribe((boards) => {
      this.boards = boards;
      this.subscription.unsubscribe();
      this.drag();
    });
  }

  ngAfterViewInit(): void {
    this.drag();
  }

  addTask(boardIndex: number): void {
    this.modal.addTaskModal(boardIndex);
  }

  editTask(boardIndex: number, taskIndex: number, task: string): void {
    this.modal.editTaskModal(boardIndex, taskIndex, task);
  }

  private drag(): void {
    this.childrenList = document.querySelectorAll('.board-task__wrapper');
    if (!Array.from(this.childrenList).length) return;

    this.subscription = new Subscription();

    setTimeout(() => this.pushDragEvents(), 0);

    setTimeout(() => this.dragStart(), 0);

    setTimeout(() => this.dragEnter(), 0);

    setTimeout(() => this.dragEnd(), 0);
  }

  private pushDragEvents() {
    this.dragStartEvents$ = [];
    this.dragEnterEvents$ = [];
    this.dragEndEvents$ = [];

    this.childrenList.forEach((childDiv) => {
      const boardChildren = (childDiv as HTMLDivElement).children;

      Array.from(boardChildren).forEach((task) => {
        this.dragStartEvents$.push(fromEvent<DragEvent>(task, 'dragstart'));
        this.dragEnterEvents$.push(fromEvent<DragEvent>(task, 'dragenter'));
        this.dragEndEvents$.push(fromEvent<DragEvent>(task, 'dragend'));
      });
    });
  }

  private dragStart(): void {
    this.dragStartEvents$.forEach((event$) => {
      this.subscription.add(
        event$.subscribe((dragStart) => {
          this.dragStartDiv = dragStart.currentTarget as HTMLDivElement;
          (dragStart.currentTarget as HTMLDivElement).style.opacity = '0.4';
        })
      );
    });
  }

  private dragEnter(): void {
    this.dragEnterEvents$.forEach((event$) =>
      this.subscription.add(
        event$.subscribe((dragEnter) => {
          this.dragEndDiv = dragEnter.currentTarget as HTMLDivElement;
          this.offset = dragEnter.offsetY;
          this.blockHeight = (
            dragEnter.currentTarget as HTMLDivElement
          ).offsetHeight;
        })
      )
    );
  }

  private dragEnd(): void {
    this.dragEndEvents$.forEach((event$) =>
      this.subscription.add(
        event$.subscribe((dragEnd) => {
          (dragEnd.currentTarget as HTMLDivElement).removeAttribute('style');

          if (this.dragStartDiv === this.dragEndDiv) return;

          // Finding an index of start column
          const startBoardColChild =
            (this.dragStartDiv.parentNode?.parentNode as HTMLDivElement) ||
            null;
          const startBoards = startBoardColChild?.parentNode || null;
          const indexOfStartCol = this.getIndexOfChild(
            startBoards,
            startBoardColChild
          );

          // Finding an index of start task
          const startBoard = this.dragStartDiv.parentNode;
          const startTaskChild = this.dragStartDiv;
          const indexOfStartTask = this.getIndexOfChild(
            startBoard,
            startTaskChild
          );

          // Finding an index of end column
          const endBoards =
            this.dragEndDiv.parentNode?.parentNode?.parentNode || null;
          const endBoardChild =
            (this.dragEndDiv.parentNode?.parentNode as HTMLDivElement) || null;
          const indexOfEndCol = this.getIndexOfChild(endBoards, endBoardChild);

          // Finding an index of end task
          const endBoard = this.dragEndDiv.parentNode;
          const endTaskChild = this.dragEndDiv;
          const indexOfEndTask = this.getIndexOfChild(endBoard, endTaskChild);

          const position = this.getPosition();

          const indexes: IndexesData = {
            start: { col: indexOfStartCol, task: indexOfStartTask },
            end: { col: indexOfEndCol, task: indexOfEndTask },
          };

          this.boardService.rearrangeTasks(indexes, position);
        })
      )
    );
  }

  private getIndexOfChild(
    parent: ParentNode | null,
    child: HTMLDivElement | null
  ): number {
    if (parent === null || child === null) return -1;

    const board = parent as HTMLDivElement;
    const boardChildren = !!board ? Array.from(board.children) : [];
    const childToFind = child;

    return boardChildren.findIndex((board) => board === childToFind);
  }

  private getPosition() {
    if (this.blockHeight / 2 < this.offset) return 'DOWN';
    return 'UP';
  }
}
