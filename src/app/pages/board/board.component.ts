import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BoardService } from '@services/board.service';
import { Board, ExpectedTask, IndexesData } from '@typescript/interfaces';
import { ModalWindowService } from '@services/modal-window.service';
import { delay, fromEvent, Observable, skip, Subject, takeUntil } from 'rxjs';
import { Direction } from '@typescript/enums';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('boardDiv') boardDiv: ElementRef | undefined;
  public projectId = 0;
  public boards: Board[] = [];
  public expectedTasks: ExpectedTask[][] = [];
  private childrenList: HTMLDivElement[] = [];

  private dragStartEvents$: Array<Observable<DragEvent>> = [];
  private dragOverEvents$: Array<Observable<DragEvent>> = [];
  private dragEndEvents$: Array<Observable<DragEvent>> = [];

  private destroy$ = new Subject();
  private rebuild$ = new Subject();

  private dragStartDiv: HTMLDivElement = this.childrenList[0] as HTMLDivElement;
  private dragEndDiv: HTMLDivElement = this.childrenList[0] as HTMLDivElement;

  private offset = 0;
  private blockHeight = 0;

  constructor(
    private boardService: BoardService,
    private modal: ModalWindowService,
    private route: ActivatedRoute
  ) {}

  private get indexOfStartCol(): number {
    const startBoardColChild =
      (this.dragStartDiv.parentNode?.parentNode as HTMLDivElement) || null;
    const startBoards = startBoardColChild?.parentNode || null;

    return this.findIndexOfChild(startBoards, startBoardColChild);
  }

  private get indexOfStartTask(): number {
    const startBoard = this.dragStartDiv.parentNode;
    const startTaskChild = this.dragStartDiv;

    const expectedTaskIndex = Array.from(startBoard?.children || []).findIndex(
      (child) => child.classList.value === 'expected-task'
    );

    const childrenArray = Array.from(startBoard?.children || []);

    if (expectedTaskIndex < 0)
      return this.findIndexOfChild(startBoard, startTaskChild);

    const childrenWithoutExpected = [
      ...childrenArray.slice(0, expectedTaskIndex),
      ...childrenArray.slice(expectedTaskIndex + 1, childrenArray.length),
    ];

    return this.findIndexOfChild(childrenWithoutExpected, startTaskChild);
  }

  private get indexOfEndCol(): number {
    const endBoards =
      this.dragEndDiv.parentNode?.parentNode?.parentNode || null;
    const endBoardChild =
      (this.dragEndDiv.parentNode?.parentNode as HTMLDivElement) || null;

    return this.findIndexOfChild(endBoards, endBoardChild);
  }

  private get indexOfEndTask(): number {
    const endBoard = this.dragEndDiv.parentNode;
    const endTaskChild = this.dragEndDiv;

    const expectedTaskIndex = Array.from(endBoard?.children || []).findIndex(
      (child) => child.classList.contains('expected-task')
    );

    const childrenArray = Array.from(endBoard?.children || []);

    if (expectedTaskIndex < 0)
      return this.findIndexOfChild(endBoard, endTaskChild);

    const childrenWithoutExpected = [
      ...childrenArray.slice(0, expectedTaskIndex),
      ...childrenArray.slice(expectedTaskIndex + 1, childrenArray.length),
    ];

    return this.findIndexOfChild(childrenWithoutExpected, endTaskChild);
  }

  private get position() {
    if (this.blockHeight / 2 < this.offset) return Direction.DOWN;

    return Direction.UP;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.projectId = Number(params['boardId']);

      this.boardService.updateBoardsById(this.projectId);
    });

    this.boardSubscriber();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.findingChildrenList();

    this.drag();
  }

  public addTask(boardIndex: number): void {
    this.modal.addTaskModal(boardIndex, this.projectId);
  }

  private boardSubscriber() {
    this.boardService.boards$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((boards) => {
        this.boards = boards;
        this.pushExpectedTasks();
        this.rebuildDestroy$();
        this.drag();
      });

    this.boardService.boards$
      .pipe(skip(1), delay(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.findingChildrenList();
        this.drag();
      });
  }

  private findingChildrenList() {
    const boards =
      (this.boardDiv?.nativeElement as HTMLDivElement).children || null;
    if (boards === null) return;

    this.childrenList = [];
    Array.from(boards).forEach((board) =>
      this.childrenList.push(board?.children[1] as HTMLDivElement)
    );
  }

  private drag(): void {
    if (!Array.from(this.childrenList).length) return;

    this.rebuildDestroy$();

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
      event$.pipe(takeUntil(this.rebuild$)).subscribe((dragStart) => {
        this.dragStartDiv = dragStart.currentTarget as HTMLDivElement;
        (dragStart.currentTarget as HTMLDivElement).style.opacity = '0.4';
        (dragStart.currentTarget as HTMLDivElement).style.border = '0';
        (dragStart.currentTarget as HTMLDivElement).style.padding = '7px 0';
      });
    });
  }

  private dragOver(): void {
    this.dragOverEvents$.forEach((event$) =>
      event$.pipe(takeUntil(this.rebuild$)).subscribe((dragOver) => {
        dragOver.preventDefault();

        this.pushExpectedTasks();

        this.dragEndDiv = dragOver.currentTarget as HTMLDivElement;
        this.offset = dragOver.offsetY;
        this.blockHeight = (
          dragOver.currentTarget as HTMLDivElement
        ).offsetHeight;

        const expectedTask =
          this.expectedTasks?.[this.indexOfEndCol]?.[this.indexOfEndTask] ||
          null;

        if (
          this.indexOfEndCol < 0 ||
          this.indexOfEndTask < 0 ||
          expectedTask === null
        )
          return;
        else if (this.position === Direction.UP) expectedTask.up = true;
        else if (this.position === Direction.DOWN) expectedTask.down = true;
      })
    );
  }

  private dragEnd(): void {
    this.dragEndEvents$.forEach((event$) => {
      event$.pipe(takeUntil(this.rebuild$)).subscribe((dragEnd) => {
        this.pushExpectedTasks();

        (dragEnd.currentTarget as HTMLDivElement).removeAttribute('style');

        dragEnd.preventDefault();

        if (this.dragStartDiv === this.dragEndDiv) return;

        const indexes: IndexesData = {
          start: { col: this.indexOfStartCol, task: this.indexOfStartTask },
          end: { col: this.indexOfEndCol, task: this.indexOfEndTask },
        };

        this.boardService.rearrangeTasks(
          indexes,
          this.position,
          this.projectId
        );
      });
    });
  }

  private findIndexOfChild(
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

  private rebuildDestroy$() {
    this.rebuild$.next(true);
    this.rebuild$.complete();
    this.rebuild$ = new Subject();
  }
}
