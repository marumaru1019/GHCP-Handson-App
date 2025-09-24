'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Todo, TodoFilter } from '@/types';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { TodoFilter as TodoFilterComponent } from './TodoFilter';
import { FileText, LayoutDashboard, Trash2 } from 'lucide-react';

const TODOS_STORAGE_KEY = 'todos';
const FILTER_STORAGE_KEY = 'todoFilter';

/**
 * TodoApp コンポーネント
 * 
 * 現在は props なし。今後拡張時は public API をJSDocで記載してください。
 */
export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 🔄 初回読み込みフラグ

  useEffect(() => {
    try {
      console.log('🔄 TodoApp: データ読み込み開始'); // 🐞 デバッグログ
      const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        console.log('📦 TodoApp: 保存されたデータ:', parsedTodos.length, '件'); // 🐞 デバッグログ
        // 📅 日付オブジェクトを復元 & カンバン用プロパティを追加
        const todosWithDates = parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          status: todo.status || (todo.completed ? 'done' : 'todo'), // 📝 既存データの互換性
          priority: todo.priority || 'medium', // 📝 デフォルト優先度
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null, // 🗓️ 期限復元 (存在すれば)
        }));
        setTodos(todosWithDates);
        console.log('✅ TodoApp: データ読み込み完了:', todosWithDates.length, '件'); // 🐞 デバッグログ
      } else {
        console.log('📭 TodoApp: 保存されたデータなし'); // 🐞 デバッグログ
      }

      const storedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
      if (storedFilter && ['all', 'active', 'completed'].includes(storedFilter)) {
        setFilter(storedFilter as TodoFilter);
      }

      setIsInitialLoad(false); // 🔄 初回読み込み完了
    } catch (error) {
      console.error('ローカルストレージからのデータ読み込みに失敗しました:', error);
      setIsInitialLoad(false); // 🔄 エラー時も初回読み込み完了とする
    }
  }, []);

  useEffect(() => {
    // 🚫 初回読み込み時は保存をスキップ
    if (isInitialLoad) return;

    try {
      console.log('💾 TodoApp: データを保存中...', todos.length, '件'); // 🐞 デバッグログ
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      console.log('✅ TodoApp: データ保存完了'); // 🐞 デバッグログ
    } catch (error) {
      console.error('❌ TodoApp: ローカルストレージへのデータ保存に失敗しました:', error);
    }
  }, [todos, isInitialLoad]);

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (error) {
      console.error('フィルター設定の保存に失敗しました:', error);
    }
  }, [filter]);

  const addTodo = (text: string, dueDate?: Date | null) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      status: 'todo', // 📝 カンバン用のステータスを追加
      priority: 'medium', // 📝 デフォルト優先度を追加
      dueDate: dueDate ?? null,
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
              status: !todo.completed ? 'done' : 'todo' // 📝 カンバンステータスも更新
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

  // 🎯 優先度更新関数
  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  // 📊 ステータス更新関数
  const updateStatus = (id: string, status: 'todo' | 'in-progress' | 'done') => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              status,
              completed: status === 'done' // 📝 completedフラグも同期
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
      console.log('🗑️ TodoApp: 全データクリア実行'); // 🐞 デバッグログ
      setTodos([]);
      setFilter('all');
      try {
        localStorage.removeItem(TODOS_STORAGE_KEY);
        localStorage.removeItem(FILTER_STORAGE_KEY);
        console.log('✅ TodoApp: ローカルストレージクリア完了'); // 🐞 デバッグログ
      } catch (error) {
        console.error('❌ TodoApp: ローカルストレージのクリアに失敗しました:', error);
      }
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 📋 ヘッダーとナビゲーション */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-[#ff0033]" size={32} />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Todo App
          </h1>
        </div>

        {/* 🔗 カンバンボードへのリンク */}
        <Link
          href="/kanban"
          className="px-4 py-2 bg-[#ff0033] hover:bg-[#e6002e] text-white rounded-lg
                   font-medium transition-colors duration-200 flex items-center gap-2
                   focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:ring-offset-2"
        >
          <LayoutDashboard size={18} />
          カンバン表示
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
  <TodoInput onAddTodo={addTodo} />

        <div className="mt-6">
          <TodoFilterComponent
            currentFilter={filter}
            onFilterChange={setFilter}
            activeTodosCount={activeTodosCount}
            completedTodosCount={completedTodosCount}
            onClearCompleted={clearCompleted}
          />
        </div>

        <div className="mt-6 space-y-2">
          {filteredTodos.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {filter === 'active' && 'アクティブなタスクはありません'}
              {filter === 'completed' && '完了したタスクはありません'}
              {filter === 'all' && 'タスクがありません。新しいタスクを追加してください。'}
            </p>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onUpdatePriority={updatePriority}
                onUpdateStatus={updateStatus}
              />
            ))
          )}
        </div>

        {todos.length > 0 && (
          <>
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
              {activeTodosCount}個のアクティブなタスク、{completedTodosCount}個の完了済みタスク
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={clearAllData}
                className="px-3 py-1 text-xs text-red-600 dark:text-red-400
                         hover:bg-red-100 dark:hover:bg-red-900 rounded border
                         border-red-300 dark:border-red-600 transition-colors duration-200
                         flex items-center gap-1 mx-auto"
                title="すべてのデータを削除"
              >
                <Trash2 size={14} />
                全データクリア
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
