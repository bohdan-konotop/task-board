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
