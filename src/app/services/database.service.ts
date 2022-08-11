import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BoardServer, ColumnServer, TaskServer } from '@typescript/interfaces';
import { Observable, retry } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private http: HttpClient, private router: Router) {}

  // SHOULD THIS FNs BE GETTER HERE ???
  public get boards(): Observable<BoardServer[]> {
    return this.http.get<BoardServer[]>('/boards').pipe(retry(5));
  }

  public get columns(): Observable<ColumnServer[]> {
    return this.http.get<ColumnServer[]>('/columns').pipe(retry(5));
  }

  public getColumnsById(id: number): Observable<ColumnServer> {
    return this.http.get<ColumnServer>(`/columns/${id}`).pipe(retry(5));
  }

  public getTasksById(id: number): Observable<TaskServer[]> {
    return this.http.get<TaskServer[]>(`/tasks?boardId=${id}`).pipe(retry(5));
  }

  public setProjectOnServer(boardId: number, name: string | null) {
    const headers = { headers: { 'Content-Type': 'application/json' } };
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

    this.http.post<ColumnServer>(`/columns/`, columnData, headers).subscribe();
    this.http.post<BoardServer[]>(`/boards/`, boardData, headers).subscribe();
    this.redirectTo(`/board/${boardId + 1}`);
  }

  public setTask(projectId: number, status: number, name: string) {
    const body = JSON.stringify({
      name,
      status: status + 1,
      boardId: projectId,
    });
    const headers = { headers: { 'Content-Type': 'application/json' } };

    this.http.post<ColumnServer>(`/tasks/`, body, headers).subscribe();
  }

  public changeTaskName(projectId: number, name: string, newTaskName: string) {
    const body = JSON.stringify({ name: newTaskName });
    const headers = { headers: { 'Content-Type': 'application/json' } };

    this.http
      .get<TaskServer[]>(`/tasks/?boardId=${projectId}&name=${name}`)
      .subscribe((task) => {
        this.http
          .patch<ColumnServer>(`/tasks/${task[0].id}`, body, headers)
          .subscribe();
      });
  }

  public deleteTask(projectId: number, name: string) {
    this.http
      .get<TaskServer[]>(`/tasks/?boardId=${projectId}&name=${name}`)
      .subscribe((task) => {
        this.http.delete<ColumnServer>(`/tasks/${task[0].id}`).subscribe();
      });
  }

  public rearangeTask(projectId: number, newPosition: number, name: string) {
    const body = JSON.stringify({ status: newPosition });
    const headers = { headers: { 'Content-Type': 'application/json' } };

    this.http
      .get<TaskServer[]>(`/tasks/?boardId=${projectId}&name=${name}`)
      .subscribe((task) => {
        this.http
          .patch<ColumnServer>(`/tasks/${task[0].id}`, body, headers)
          .subscribe();
      });
  }

  private redirectTo(link: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      return this.router.navigate([link]);
    });
  }
}
