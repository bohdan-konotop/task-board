import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BoardService } from '../services/board.service';
import { Board, ExpectedTask, IndexesData } from '../interfaces';
import { ModalWindowService } from '../services/modal-window.service';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewInit {
  @ViewChild('boardDiv') boardDiv: ElementRef | undefined;

  boards: Board[] = this.boardService.boardsInitial;
  expectedTasks: ExpectedTask[][] = [];

  private childrenList: HTMLDivElement[] = [];

  private dragStartEvents$: Array<Observable<DragEvent>> = [];
  private dragOverEvents$: Array<Observable<DragEvent>> = [];
  private dragEndEvents$: Array<Observable<DragEvent>> = [];

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
    this.boardSubscriber();
  }

  ngAfterViewInit(): void {
    this.findingChildrenList();

    this.drag();
  }

  addTask(boardIndex: number): void {
    this.modal.addTaskModal(boardIndex);
  }

  private boardSubscriber() {
    this.boardService.boards$.subscribe((boards) => {
      this.boards = boards;
      this.pushExpectedTasks();
      this.subscription.unsubscribe();
      this.drag();
    });
  }

  private findingChildrenList() {
    const boards =
      (this.boardDiv?.nativeElement as HTMLDivElement).children || null;
    if (boards === null) return;
    Array.from(boards).forEach((board) =>
      this.childrenList.push(board?.children[1] as HTMLDivElement)
    );
  }

  private drag(): void {
    if (!Array.from(this.childrenList).length) return;

    this.subscription = new Subscription();

    setTimeout(() => {
      this.pushDragEvents();
      this.dragStart();
      this.dragOver();
      this.dragEnd();
    }, 0);
  }

  private pushExpectedTasks(): void {
    this.expectedTasks = Array.from(
      { length: this.boards.length },
      (_, index) => {
        return [
          ...Array.from({ length: this.boards[index].tasks.length }, () => {
            return {
              up: false,
              down: false,
            };
          }),
        ];
      }
    );

    // this.boards.forEach((board, i) => {
    //   board.tasks.forEach((_, j) => {
    //     this.expectedTasks[i][j] = { up: false, down: false };
    //   });
    // });
  }

  private pushDragEvents(): void {
    this.dragStartEvents$ = [];
    this.dragOverEvents$ = [];
    this.dragEndEvents$ = [];

    this.childrenList.forEach((childDiv) => {
      const boardChildren = (childDiv as HTMLDivElement).children;

      Array.from(boardChildren).forEach((task) => {
        this.dragStartEvents$.push(fromEvent<DragEvent>(task, 'dragstart'));
        this.dragOverEvents$.push(fromEvent<DragEvent>(task, 'dragover'));
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
          (dragStart.currentTarget as HTMLDivElement).style.border = '0';
          (dragStart.currentTarget as HTMLDivElement).style.padding = '7px 0';
        })
      );
    });
  }

  private dragOver(): void {
    this.dragOverEvents$.forEach((event$) =>
      this.subscription.add(
        event$.subscribe((dragOver) => {
          dragOver.preventDefault();

          this.pushExpectedTasks();

          this.dragEndDiv = dragOver.currentTarget as HTMLDivElement;
          this.offset = dragOver.offsetY;
          this.blockHeight = (
            dragOver.currentTarget as HTMLDivElement
          ).offsetHeight;

          const indexOfCol = this.findIndexOfEndCol();
          const indexOfTask = this.findIndexOfEndTask();

          const position = this.getPosition();

          const expectedTask =
            this.expectedTasks?.[indexOfCol]?.[indexOfTask] || null;

          if (indexOfCol < 0 || indexOfTask < 0 || expectedTask === null)
            return;
          else if (position === 'UP') expectedTask.up = true;
          else if (position === 'DOWN') expectedTask.down = true;
        })
      )
    );
  }

  private dragEnd(): void {
    this.dragEndEvents$.forEach((event$) =>
      this.subscription.add(
        event$.subscribe((dragEnd) => {
          this.pushExpectedTasks();

          (dragEnd.currentTarget as HTMLDivElement).removeAttribute('style');

          dragEnd.preventDefault();

          if (this.dragStartDiv === this.dragEndDiv) return;

          const indexOfStartCol = this.findIndexOfStartCol();
          const indexOfStartTask = this.findIndexOfStartTask();
          const indexOfEndCol = this.findIndexOfEndCol();
          const indexOfEndTask = this.findIndexOfEndTask();

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

  private findIndexOfStartCol(): number {
    const startBoardColChild =
      (this.dragStartDiv.parentNode?.parentNode as HTMLDivElement) || null;
    const startBoards = startBoardColChild?.parentNode || null;
    return this.getIndexOfChild(startBoards, startBoardColChild);
  }

  private findIndexOfStartTask(): number {
    const startBoard = this.dragStartDiv.parentNode;
    const startTaskChild = this.dragStartDiv;

    const expectedTaskIndex = Array.from(startBoard?.children || []).findIndex(
      (child) => child.classList.value === 'expected-task'
    );

    const childrenArray = Array.from(startBoard?.children || []);

    if (expectedTaskIndex < 0)
      return this.getIndexOfChild(startBoard, startTaskChild);

    const childrenWithoutExpected = [
      ...childrenArray.slice(0, expectedTaskIndex),
      ...childrenArray.slice(expectedTaskIndex + 1, childrenArray.length),
    ];

    return this.getIndexOfChild(childrenWithoutExpected, startTaskChild);
  }

  private findIndexOfEndCol(): number {
    const endBoards =
      this.dragEndDiv.parentNode?.parentNode?.parentNode || null;
    const endBoardChild =
      (this.dragEndDiv.parentNode?.parentNode as HTMLDivElement) || null;
    return this.getIndexOfChild(endBoards, endBoardChild);
  }

  private findIndexOfEndTask(): number {
    const endBoard = this.dragEndDiv.parentNode;
    const endTaskChild = this.dragEndDiv;

    const expectedTaskIndex = Array.from(endBoard?.children || []).findIndex(
      (child) => child.classList.value === 'expected-task'
    );

    const childrenArray = Array.from(endBoard?.children || []);

    if (expectedTaskIndex < 0)
      return this.getIndexOfChild(endBoard, endTaskChild);

    const childrenWithoutExpected = [
      ...childrenArray.slice(0, expectedTaskIndex),
      ...childrenArray.slice(expectedTaskIndex + 1, childrenArray.length),
    ];

    return this.getIndexOfChild(childrenWithoutExpected, endTaskChild);
  }

  private getIndexOfChild(
    parent: ParentNode | Element[] | null,
    child: HTMLDivElement | null
  ): number {
    if (parent === null || child === null) return -1;

    if (Array.isArray(parent)) {
      return parent.findIndex((board) => board === child);
    }

    const board = parent as HTMLDivElement;
    const boardChildren = !!board ? Array.from(board.children) : [];

    return boardChildren.findIndex((board) => board === child);
  }

  private getPosition() {
    if (this.blockHeight / 2 < this.offset) return 'DOWN';
    return 'UP';
  }
}
