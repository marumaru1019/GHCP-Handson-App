export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  status?: TodoStatus;
  priority?: Priority;
}

export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
