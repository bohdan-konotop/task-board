import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board, IndexesData } from '../interfaces';

// TODO: Move to consts
export enum Direction {
  UP = 'up',
  DOWN = 'down'
}

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
  boardsInitial: Board[] = JSON.parse(
    localStorage.getItem('boards') || JSON.stringify(this.firstRun)
  );
  private boards = new BehaviorSubject(this.boardsInitial);
  // should be public
  public boards$ = this.boards.asObservable();

  get boardsValue(): Array<Board> {
    return  [...this.boards.value];
  }

  //TODO: naming arguments, it's not a num, is index
  addTask(boardNum: number | null, taskText: string): void {
    if (boardNum === null) return;

    // TODO: this.boards.value move to getter
    const boards = this.boardsValue;
    boards[boardNum].tasks = [...boards[boardNum].tasks, taskText];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  editTask(boardNum: number, taskNum: number, inputValue: string): void {
    const boards = [...this.boards.value];

    boards[boardNum].tasks[taskNum] = inputValue;

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }
  // TODO: All strings should be in constants, for UP | DOWN should be in type
  rearrangeTasks(indexes: IndexesData, type: Direction): void {
    const boards = [...this.boards.value];
    const currentTask = boards[indexes.start.col].tasks[indexes.start.task];
    const startColumn = boards[indexes.start.col];
    const endColumn = boards[indexes.end.col];

    startColumn.tasks = [...startColumn.tasks.filter((_, index) => index !== indexes.start.task)];

    if (indexes.start.col === indexes.end.col && indexes.start.task < indexes.end.task) {
      indexes.end.task -= 1;
    }

    const countIndex = indexes.end.task + (type === Direction.UP ? 0 : 1);

    endColumn.tasks.splice(countIndex, 0, currentTask);

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  deleteTask(boardIndex: number, taskIndex: number): void {
    const boards = [...this.boards.value];

    boards[boardIndex].tasks = [...boards[boardIndex].tasks.filter((_, index) => index !== taskIndex)];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }
}
