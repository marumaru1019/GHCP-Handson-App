export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  status?: TodoStatus;
  priority?: Priority;
}

/**
 * localStorage に保存される Todo の型
 * createdAt は Date ではなく ISO 8601 形式の文字列として保存される
 */
export interface SerializedTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status?: TodoStatus;
  priority?: Priority;
}

export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
