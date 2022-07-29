export interface Board {
  title: string;
  tasks: string[];
}

export interface Modal {
  show: boolean;
  activity: 'Add' | 'Edit' | null;
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
