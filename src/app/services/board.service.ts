import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Board } from '../interfaces';
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
}
