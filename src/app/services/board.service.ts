import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board, IndexesData } from '@interfaces';
import { Direction } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  // TODO: ADD service from API
  private firstRun = [
    { title: 'Todo', tasks: [] },
    { title: 'In Progress', tasks: [] },
    { title: 'Review', tasks: [] },
    { title: 'Done', tasks: [] },
  ];
  // TODO: Rework with try/catch
  public boardsInitial: Board[] = JSON.parse(
    localStorage.getItem('boards') || JSON.stringify(this.firstRun)
  );
  private boards = new BehaviorSubject(this.boardsInitial);
  public boards$ = this.boards.asObservable();

  get boardsValue(): Array<Board> {
    return [...this.boards.value];
  }

  public addTask(boardIndex: number | null, taskText: string): void {
    if (boardIndex === null) return;

    const boards = this.boardsValue;
    boards[boardIndex].tasks = [...boards[boardIndex].tasks, taskText];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  public editTask(
    boardIndex: number,
    taskNum: number,
    inputValue: string
  ): void {
    const boards = [...this.boards.value];

    boards[boardIndex].tasks[taskNum] = inputValue;

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  public rearrangeTasks(indexes: IndexesData, type: Direction): void {
    const boards = [...this.boards.value];
    const currentTask = boards[indexes.start.col].tasks[indexes.start.task];
    const startColumn = boards[indexes.start.col];
    const endColumn = boards[indexes.end.col];

    startColumn.tasks = [
      ...startColumn.tasks.filter((_, index) => index !== indexes.start.task),
    ];

    if (
      indexes.start.col === indexes.end.col &&
      indexes.start.task < indexes.end.task
    ) {
      indexes.end.task -= 1;
    }

    const countIndex = indexes.end.task + (type === Direction.UP ? 0 : 1);

    endColumn.tasks.splice(countIndex, 0, currentTask);

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  public deleteTask(boardIndex: number, taskIndex: number): void {
    const boards = [...this.boards.value];

    boards[boardIndex].tasks = [
      ...boards[boardIndex].tasks.filter((_, index) => index !== taskIndex),
    ];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }
}
