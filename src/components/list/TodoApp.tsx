'use client';

import Link from 'next/link';
import { useTodos } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { TodoFilter as TodoFilterComponent } from './TodoFilter';
import { FileText, LayoutDashboard, Trash2 } from 'lucide-react';

export function TodoApp() {
  const {
    filteredTodos,
    filter,
    activeTodosCount,
    completedTodosCount,
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    updatePriority,
    updateStatus,
    clearCompleted,
    clearAllData,
    setFilter,
  } = useTodos();

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
