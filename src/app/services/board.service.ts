import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board, IndexesData } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private firstRun = [
    { title: 'Todo', tasks: [] },
    { title: 'In Progress', tasks: [] },
    { title: 'Done', tasks: [] },
  ];
  boardsInitial: Board[] = JSON.parse(
    localStorage.getItem('boards') || JSON.stringify(this.firstRun)
  );
  private boards = new BehaviorSubject(this.boardsInitial);
  boards$ = this.boards.asObservable();

  addTask(boardNum: number | null, taskText: string): void {
    if (boardNum === null) return;

    const boards = [...this.boards.value];
    const colTasks = [...boards[boardNum].tasks];

    colTasks.push(taskText);

    boards[boardNum].tasks = colTasks;

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  editTask(boardNum: number, taskNum: number, inputValue: string): void {
    const boards = [...this.boards.value];

    boards[boardNum].tasks[taskNum] = inputValue;

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  rearrangeTasks(indexes: IndexesData, type: 'UP' | 'DOWN'): void {
    const boards = [...this.boards.value];
    const startText = boards[indexes.start.col].tasks[indexes.start.task];
    const startBoard = boards[indexes.start.col];
    const endBoard = boards[indexes.end.col];

    startBoard.tasks = [
      ...startBoard.tasks.slice(0, indexes.start.task),
      ...startBoard.tasks.slice(
        indexes.start.task + 1,
        startBoard.tasks.length
      ),
    ];

    if (
      indexes.start.col === indexes.end.col &&
      indexes.start.task < indexes.end.task
    )
      indexes.end.task--;

    endBoard.tasks = [
      ...endBoard.tasks.slice(0, indexes.end.task + (type === 'UP' ? 0 : 1)),
      startText,
      ...endBoard.tasks.slice(
        indexes.end.task + (type === 'UP' ? 0 : 1),
        endBoard.tasks.length
      ),
    ];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }

  deleteTask(boardIndex: number, taskIndex: number): void {
    const boards = [...this.boards.value];

    boards[boardIndex].tasks = [
      ...boards[boardIndex].tasks.slice(0, taskIndex),
      ...boards[boardIndex].tasks.slice(
        taskIndex + 1,
        boards[boardIndex].tasks.length
      ),
    ];

    this.boards.next(boards);
    localStorage.setItem('boards', JSON.stringify(boards));
  }
}
