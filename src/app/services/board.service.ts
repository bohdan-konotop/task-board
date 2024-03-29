import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { Board, IndexesData } from '@typescript/interfaces';
import { Direction } from '@typescript/enums';
import { DatabaseService } from '@services/database.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private boards: BehaviorSubject<Board[]> = new BehaviorSubject<Board[]>([]);
  public boards$ = this.boards.asObservable();

  private titles: string[] = [];
  private tasks: string[][] = [];
  private columns: Board[] = [];

  constructor(private db: DatabaseService) {}

  get boardsValue(): Array<Board> {
    return [...this.boards.value];
  }

  public updateBoardsById(id: number) {
    this.titles = [];
    this.tasks = [];
    this.columns = [];

    this.getColumns(id);
  }

  public addTask(
    boardIndex: number | null,
    taskText: string,
    projectId: number
  ): void {
    if (boardIndex === null) return;

    const boards = this.boardsValue;
    boards[boardIndex].tasks = [...boards[boardIndex].tasks, taskText];

    this.boards.next(boards);
    this.db.setTask(projectId, boardIndex, taskText);
  }

  public editTask(
    boardIndex: number,
    taskIndex: number,
    inputValue: string,
    projectId: number
  ): void {
    const boards = this.boardsValue;

    const name = this.boardsValue[boardIndex].tasks[taskIndex];

    boards[boardIndex].tasks[taskIndex] = inputValue;

    this.boards.next(boards);
    this.db.changeTaskName(projectId, name, inputValue);
  }

  public rearrangeTasks(
    indexes: IndexesData,
    type: Direction,
    projectId: number
  ): void {
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

    this.db.rearangeTask(projectId, indexes.end.col + 1, currentTask);
  }

  public deleteTask(
    boardIndex: number,
    taskIndex: number,
    projectId: number
  ): void {
    const boards = this.boardsValue;

    const name = boards[boardIndex].tasks[taskIndex];

    boards[boardIndex].tasks = [
      ...boards[boardIndex].tasks.filter((_, index) => index !== taskIndex),
    ];

    this.boards.next(boards);

    this.db.deleteTask(projectId, name);
  }

  private getColumns(id: number) {
    this.db
      .getColumnsById(id)
      .pipe(first())
      .subscribe((column) => {
        column.cols.forEach((col) => this.titles.push(col.title));
        this.tasks = Array.from({ length: this.titles.length }, () => []);

        this.getTasks(id);
      });
  }

  private getTasks(id: number) {
    this.db
      .getTasksById(id)
      .pipe(first())
      .subscribe((tasks) => {
        tasks.forEach((task) => {
          this.tasks[task.status - 1].push(task.name);
        });

        this.titles.forEach((title, i) =>
          this.columns.push({ title, tasks: this.tasks[i] })
        );
        this.boards.next(this.columns);
      });
  }
}
