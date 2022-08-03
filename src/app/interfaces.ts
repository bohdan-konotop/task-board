import { ModalAction } from '@enums';

export interface Board {
  title: string;
  tasks: string[];
}

export interface Modal {
  show: boolean;
  action: ModalAction;
  boardNum: number | null;
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
