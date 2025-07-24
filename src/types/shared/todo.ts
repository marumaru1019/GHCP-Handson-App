export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  status?: KanbanStatus;
  priority?: Priority;
}

export type KanbanStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
