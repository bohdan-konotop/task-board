import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BoardServer, ColumnServer, TaskServer } from '@typescript/interfaces';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

const headers = { headers: { 'Content-Type': 'application/json' } };
const URL = {
  boards: '/boards/',
  columns: '/columns/',
  tasks: '/tasks/',
};

@Injectable({
  providedIn: 'root',
})
export class DatabaseService implements OnDestroy {
  private destroy$ = new Subject();

  constructor(private http: HttpClient, private router: Router) {}

  public getBoards(): Observable<BoardServer[]> {
    return this.http.get<BoardServer[]>(URL.boards);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public getColumns(): Observable<ColumnServer[]> {
    return this.http.get<ColumnServer[]>(URL.columns);
  }

  public getColumnsById(id: number): Observable<ColumnServer> {
    return this.http.get<ColumnServer>(URL.columns + id);
  }

  public getTasksById(id: number): Observable<TaskServer[]> {
    const params = { boardId: id };

    return this.http.get<TaskServer[]>(URL.tasks, { params });
  }

  public setProjectOnServer(boardId: number, name: string | null) {
    const columnData = JSON.stringify({
      cols: [
        {
          id: 1,
          title: 'Todo',
        },
        {
          id: 2,
          title: 'In Progress',
        },
        {
          id: 3,
          title: 'Done',
        },
      ],
    });
    const boardData = JSON.stringify({
      name,
    });

    this.http
      .post<ColumnServer>(URL.columns, columnData, headers)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.http
      .post<BoardServer[]>(URL.boards, boardData, headers)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.redirectTo(URL.boards + boardId + 1);
  }

  public setTask(projectId: number, status: number, name: string) {
    const body = JSON.stringify({
      name,
      status: status + 1,
      boardId: projectId,
    });

    this.http
      .post<ColumnServer>(URL.tasks, body, headers)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public changeTaskName(projectId: number, name: string, newTaskName: string) {
    const params = { boardId: projectId, name };
    const body = JSON.stringify({ name: newTaskName });

    this.http
      .get<TaskServer[]>(URL.tasks, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe((task) => {
        this.http
          .patch<ColumnServer>(URL.tasks + task[0].id, body, headers)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      });
  }

  public deleteTask(projectId: number, name: string) {
    const params = { boardId: projectId, name };

    this.http
      .get<TaskServer[]>(URL.tasks, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe((task) => {
        this.http
          .delete<ColumnServer>(URL.tasks + task[0].id)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      });
  }

  public rearangeTask(projectId: number, newPosition: number, name: string) {
    const body = JSON.stringify({ status: newPosition });
    const params = { boardId: projectId, name };

    this.http
      .get<TaskServer[]>(URL.tasks, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe((task) => {
        this.http
          .patch<ColumnServer>(URL.tasks + task[0].id, body, headers)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      });
  }

  private redirectTo(link: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      return this.router.navigate([link]);
    });
  }
}
