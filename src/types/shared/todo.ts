export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  status?: TodoStatus;
  priority?: Priority;
  /**
   * 期限 (締め切り)。未設定の場合は null / undefined。
   * LocalStorage では ISO 文字列としてシリアライズされる。
   */
  dueDate?: Date | null;
}

export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
