'use client';

import { useState } from 'react';
import { Todo, KanbanStatus, KanbanColumn, Priority } from '@/types';
import { KanbanCard } from './KanbanCard';
import { RotateCcw, Zap, CheckCircle, Inbox } from 'lucide-react';

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateStatus: (id: string, status: KanbanStatus) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onEditTodo: (id: string, newText: string) => void;
  onDeleteTodo: (id: string) => void;
}

// 📋 カンバンボードの列定義
const columns: KanbanColumn[] = [
  {
    id: 'todo',
    title: '未着手 (TODO)',
    color: 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20',
    icon: RotateCcw,
  },
  {
    id: 'in-progress',
    title: '進行中 (IN PROGRESS)',
    color: 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20',
    icon: Zap,
  },
  {
    id: 'done',
    title: '完了 (DONE)',
    color: 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
    icon: CheckCircle,
  },
];

export function KanbanBoard({
  todos,
  onUpdateStatus,
  onUpdatePriority,
  onEditTodo,
  onDeleteTodo,
}: KanbanBoardProps) {
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  // 🖱️ ドラッグ開始
  const handleDragStart = (todo: Todo) => {
    setDraggedTodo(todo);
  };

  // 🖱️ ドラッグ終了
  const handleDragEnd = () => {
    setDraggedTodo(null);
  };

  // 📥 ドロップ処理
  const handleDrop = (status: KanbanStatus) => {
    if (draggedTodo && draggedTodo.status !== status) {
      onUpdateStatus(draggedTodo.id, status);
    }
    setDraggedTodo(null);
  };

  // 📋 ドラッグオーバー処理（ドロップを許可）
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 📊 各列のTodoを取得
  const getTodosForColumn = (status: KanbanStatus) => {
    return todos
      .filter(todo => (todo.status || (todo.completed ? 'done' : 'todo')) === status)
      .sort((a, b) => {
        // 📅 優先度順でソート、同じ優先度なら作成日順
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTodos = getTodosForColumn(column.id);

        return (
          <div
            key={column.id}
            className={`rounded-lg border-2 border-dashed p-4 min-h-[400px] ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* 📋 列ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <column.icon size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                  {column.title}
                </h2>
              </div>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                             px-2 py-1 rounded-full text-sm font-medium">
                {columnTodos.length}
              </span>
            </div>

            {/* 📝 Todoカード */}
            <div className="space-y-3">
              {columnTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Inbox size={48} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm">
                    {column.id === 'todo' && 'タスクがありません'}
                    {column.id === 'in-progress' && '進行中のタスクがありません'}
                    {column.id === 'done' && '完了したタスクがありません'}
                  </p>
                </div>
              ) : (
                columnTodos.map((todo) => (
                  <KanbanCard
                    key={todo.id}
                    todo={todo}
                    onDragStart={() => handleDragStart(todo)}
                    onDragEnd={handleDragEnd}
                    onUpdatePriority={onUpdatePriority}
                    onEditTodo={onEditTodo}
                    onDeleteTodo={onDeleteTodo}
                    isDragging={draggedTodo?.id === todo.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
