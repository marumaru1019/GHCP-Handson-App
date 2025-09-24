import { useState, useEffect } from 'react';
import { Todo, TodoFilter } from '@/types';

const TODOS_STORAGE_KEY = 'todos';
const FILTER_STORAGE_KEY = 'todoFilter';

export interface UseTodosReturn {
  // State
  todos: Todo[];
  filter: TodoFilter;
  isInitialLoad: boolean;
  
  // Computed values
  filteredTodos: Todo[];
  activeTodosCount: number;
  completedTodosCount: number;
  
  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newText: string) => void;
  updatePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  updateStatus: (id: string, status: 'todo' | 'in-progress' | 'done') => void;
  clearCompleted: () => void;
  clearAllData: () => void;
  setFilter: (filter: TodoFilter) => void;
}

export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 初回データ読み込み
  useEffect(() => {
    try {
      console.log('🔄 useTodos: データ読み込み開始');
      const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        console.log('📦 useTodos: 保存されたデータ:', parsedTodos.length, '件');
        // 日付オブジェクトを復元 & カンバン用プロパティを追加
        const todosWithDates = parsedTodos.map((todo: unknown) => {
          if (typeof todo === 'object' && todo !== null && 'id' in todo && 'text' in todo) {
            const todoObj = todo as Record<string, unknown>;
            return {
              ...todoObj,
              createdAt: new Date(todoObj.createdAt as string),
              status: todoObj.status || (todoObj.completed ? 'done' : 'todo'),
              priority: todoObj.priority || 'medium',
            } as Todo;
          }
          throw new Error('Invalid todo data structure');
        });
        setTodos(todosWithDates);
        console.log('✅ useTodos: データ読み込み完了:', todosWithDates.length, '件');
      } else {
        console.log('📭 useTodos: 保存されたデータなし');
      }

      const storedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
      if (storedFilter && ['all', 'active', 'completed'].includes(storedFilter)) {
        setFilter(storedFilter as TodoFilter);
      }

      setIsInitialLoad(false);
    } catch (error) {
      console.error('ローカルストレージからのデータ読み込みに失敗しました:', error);
      setIsInitialLoad(false);
    }
  }, []);

  // todos の永続化
  useEffect(() => {
    if (isInitialLoad) return;

    try {
      console.log('💾 useTodos: データを保存中...', todos.length, '件');
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      console.log('✅ useTodos: データ保存完了');
    } catch (error) {
      console.error('❌ useTodos: ローカルストレージへのデータ保存に失敗しました:', error);
    }
  }, [todos, isInitialLoad]);

  // filter の永続化
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (error) {
      console.error('フィルター設定の保存に失敗しました:', error);
    }
  }, [filter]);

  // CRUD 操作
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      status: 'todo',
      priority: 'medium',
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: !todo.completed ? 'done' : 'todo'
            }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id: string, newText: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    );
  };

  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  const updateStatus = (id: string, status: 'todo' | 'in-progress' | 'done') => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              status,
              completed: status === 'done'
            }
          : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const clearAllData = () => {
    if (window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) {
      console.log('🗑️ useTodos: 全データクリア実行');
      setTodos([]);
      setFilter('all');
      try {
        localStorage.removeItem(TODOS_STORAGE_KEY);
        localStorage.removeItem(FILTER_STORAGE_KEY);
        console.log('✅ useTodos: ローカルストレージクリア完了');
      } catch (error) {
        console.error('❌ useTodos: ローカルストレージのクリアに失敗しました:', error);
      }
    }
  };

  // フィルタリングと計算値
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return {
    // State
    todos,
    filter,
    isInitialLoad,
    
    // Computed values
    filteredTodos,
    activeTodosCount,
    completedTodosCount,
    
    // Actions
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    updatePriority,
    updateStatus,
    clearCompleted,
    clearAllData,
    setFilter,
  };
};