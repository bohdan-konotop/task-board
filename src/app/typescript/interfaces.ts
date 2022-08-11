import { ModalAction } from './enums';

export interface Board {
  title: string;
  tasks: string[];
}

export interface Modal {
  show: boolean;
  action: ModalAction;
  projectId?: number;
  boardNum?: number;
  taskNum?: number;
  editText?: string;
}

export interface IndexesData {
  start: { col: number; task: number };
  end: { col: number; task: number };
}

export interface ExpectedTask {
  up: boolean;
  down: boolean;
}

export interface Server {
  id: number;
  body: Board[];
}

export interface BoardServer {
  id: number;
  name: string;
}

export interface ColumnServer {
  id: number;
  cols: ColServer[];
}

export interface ColServer {
  id: number;
  title: string;
}

export interface TaskServer {
  id: number;
  name: string;
  boardId: number;
  status: number;
}
