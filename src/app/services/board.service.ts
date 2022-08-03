import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { Board, IndexesData } from '@interfaces';
import { Direction } from '@enums';
import { DatabaseService } from '@services/database.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private boards: BehaviorSubject<Board[]> = new BehaviorSubject<Board[]>([]);
  public boards$ = this.boards.asObservable();

  constructor(private db: DatabaseService) {
    this.db.boardsFromServer.pipe(first()).subscribe((boards) => {
      this.boards.next(boards.body);
    });
  }

  get boardsValue(): Array<Board> {
    return [...this.boards.value];
  }

  public addTask(boardIndex: number | null, taskText: string): void {
    if (boardIndex === null) return;

    const boards = this.boardsValue;
    boards[boardIndex].tasks = [...boards[boardIndex].tasks, taskText];

    this.boards.next(boards);
    this.db.setBoardsOnServer(boards).subscribe();
  }

  public editTask(
    boardIndex: number,
    taskNum: number,
    inputValue: string
  ): void {
    const boards = this.boardsValue;

    boards[boardIndex].tasks[taskNum] = inputValue;

    this.boards.next(boards);
    this.db.setBoardsOnServer(boards).subscribe();
  }

  public rearrangeTasks(indexes: IndexesData, type: Direction): void {
    const boards = this.boardsValue;
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
    this.db.setBoardsOnServer(boards).subscribe();
  }

  public deleteTask(boardIndex: number, taskIndex: number): void {
    const boards = this.boardsValue;

    boards[boardIndex].tasks = [
      ...boards[boardIndex].tasks.filter((_, index) => index !== taskIndex),
    ];

    this.boards.next(boards);

    this.db.setBoardsOnServer(boards).subscribe();
  }
}
