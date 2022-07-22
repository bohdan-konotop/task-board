import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board, IndexesData } from '../interfaces';
import { getBoardsFromStorage } from '../storage-functions';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  boardsInitial: Board[] = getBoardsFromStorage();
  private boards = new BehaviorSubject(this.boardsInitial);
  boards$ = this.boards.asObservable();

  addTask(boardNum: number | null, taskText: string) {
    if (boardNum === null) return;

    const boards = [...this.boards.value];

    boards[boardNum].tasks.push(taskText);

    this.boards.next(boards);
  }

  editTask(boardNum: number, taskNum: number, inputValue: string): void {
    if (boardNum === null || taskNum === null) return;

    const boards = [...this.boards.value];

    boards[boardNum].tasks[taskNum] = inputValue;

    this.boards.next(boards);
  }

  rearrangeTasks(indexes: IndexesData, type: 'UP' | 'DOWN'): void {
    const boards = [...this.boards.value];
    const startBoard = boards[indexes.start.col];
    const startText = boards[indexes.start.col].tasks[indexes.start.task];
    const endBoard = boards[indexes.end.col];

    startBoard.tasks = [
      ...startBoard.tasks.slice(0, indexes.start.task),
      ...startBoard.tasks.slice(
        indexes.start.task + 1,
        startBoard.tasks.length
      ),
    ];

    if (type === 'UP') {
      endBoard.tasks = [
        ...endBoard.tasks.slice(0, indexes.end.task),
        startText,
        ...endBoard.tasks.slice(indexes.end.task, endBoard.tasks.length),
      ];
    } else {
      endBoard.tasks = [
        ...endBoard.tasks.slice(0, indexes.end.task + 1),
        startText,
        ...endBoard.tasks.slice(indexes.end.task + 1, endBoard.tasks.length),
      ];
    }

    this.boards.next(boards);
  }
}
