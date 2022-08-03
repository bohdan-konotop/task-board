import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board, Server } from '@interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private http: HttpClient) {}

  public get boardsFromServer(): Observable<Server> {
    const URL = 'http://localhost:3000/boards/1';

    return this.http.get<Server>(URL);
  }

  public setBoardsOnServer(boards: Board[]): Observable<Server> {
    const URL = 'http://localhost:3000/boards/1';
    const body = JSON.stringify({ body: boards });
    const headers = { headers: { 'Content-Type': 'application/json' } };

    return this.http.patch<Server>(URL, body, headers);
  }
}
