'use client';

import { useState, useEffect } from 'react';
import { Todo, KanbanStatus, Priority } from '@/types';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { loadSampleData } from '@/lib/sampleData';
import Link from 'next/link';
import { LayoutDashboard, FileText, Plus, BarChart3 } from 'lucide-react';

const TODOS_STORAGE_KEY = 'todos';

export default function KanbanPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 📝 ローカルストレージからTodoデータを読み込み
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        const todosWithDates = parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          status: todo.status || (todo.completed ? 'done' : 'todo'),
          priority: todo.priority || 'medium',
        }));
        setTodos(todosWithDates);
      }
      setIsInitialLoad(false);
    } catch (error) {
      console.error('ローカルストレージからのデータ読み込みに失敗しました:', error);
      setIsInitialLoad(false);
    }
  }, []);

  // 💾 Todoデータの変更をローカルストレージに保存
  useEffect(() => {
    if (isInitialLoad) return;
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('❌ Kanban: ローカルストレージへのデータ保存に失敗しました:', error);
    }
  }, [todos, isInitialLoad]);

  // 🔄 Todoのステータスを更新
  const updateTodoStatus = (id: string, status: KanbanStatus) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, status, completed: status === 'done' }
          : todo
      )
    );
  };

  // 🎯 Todoの優先度を更新
  const updateTodoPriority = (id: string, priority: Priority) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      )
    );
  };

  // ✏️ Todoのテキストを編集
  const editTodo = (id: string, newText: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    );
  };

  // 🗑️ Todoを削除
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // 🧪 サンプルデータを読み込む
  const loadSampleDataHandler = () => {
    if (window.confirm('サンプルデータを読み込みますか？既存のデータに追加されます。')) {
      const sampleData = loadSampleData();
      if (sampleData) {
        setTodos(prev => {
          const existingIds = new Set(prev.map(todo => todo.id));
          const newSampleData = sampleData.filter(todo => !existingIds.has(todo.id));
          return [...prev, ...newSampleData];
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* 📋 ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-[#ff0033]" size={32} />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                カンバンボード
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                タスクをドラッグ&ドロップで管理
              </p>
            </div>
          </div>

          {/* 🔗 ナビゲーション */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors duration-200 flex items-center gap-2"
            >
              <FileText size={18} />
              リスト表示
            </Link>

            {/* 🧪 サンプルデータボタン */}
            {todos.length === 0 && (
              <button
                onClick={loadSampleDataHandler}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         transition-colors duration-200"
              >
                🧪 サンプルデータ
              </button>
            )}
          </div>
        </div>

        {/* 📊 カンバンボード */}
        {todos.length === 0 ? (
          <div className="text-center py-16">
            <LayoutDashboard size={80} className="text-gray-400 dark:text-gray-500 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
              タスクがありません
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              メインページでタスクを作成するか、サンプルデータを読み込んでください
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-[#ff0033] hover:bg-[#e6002e] text-white rounded-lg
                         font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={18} />
                タスクを作成
              </Link>
              <button
                onClick={loadSampleDataHandler}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                         font-medium transition-colors duration-200 flex items-center gap-2"
              >
                🧪 サンプルデータ
              </button>
            </div>
          </div>
        ) : (
          <KanbanBoard
            todos={todos}
            onUpdateStatus={updateTodoStatus}
            onUpdatePriority={updateTodoPriority}
            onEditTodo={editTodo}
            onDeleteTodo={deleteTodo}
          />
        )}

        {/* 📈 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                未着手
              </h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todos.filter(todo => todo.status === 'todo').length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                進行中
              </h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {todos.filter(todo => todo.status === 'in-progress').length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                完了
              </h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {todos.filter(todo => todo.status === 'done').length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                合計
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {todos.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
