'use client';

import { useState } from 'react';
import { Todo, Priority } from '@/types';
import { AlertCircle, Circle, CheckCircle, Edit3, Trash2 } from 'lucide-react';

interface KanbanCardProps {
  todo: Todo;
  onDragStart: () => void;
  onDragEnd: () => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onEditTodo: (id: string, newText: string) => void;
  onDeleteTodo: (id: string) => void;
  isDragging: boolean;
}

export function KanbanCard({
  todo,
  onDragStart,
  onDragEnd,
  onUpdatePriority,
  onEditTodo,
  onDeleteTodo,
  isDragging,
}: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editError, setEditError] = useState<string | null>(null);

  // 🎨 優先度に応じたアイコンとスタイルを取得
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'medium':
        return <Circle size={16} className="text-yellow-500" />;
      case 'low':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Circle size={16} className="text-gray-500" />;
    }
  };

  // 🎨 優先度に応じたバッジスタイルを取得
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // ✏️ 編集モードの開始
  const handleEditStart = () => {
    setIsEditing(true);
    setEditText(todo.text);
    setEditError(null);
  };

  // ✅ 編集の保存
  const handleEditSave = () => {
    const trimmedText = editText.trim();
    // 🚩 空文字列の場合はエラーメッセージを表示
    if (!trimmedText) {
      setEditError('タスク内容を入力してください');
      return;
    }
    if (trimmedText !== todo.text) {
      onEditTodo(todo.id, trimmedText);
    }
    setEditError(null);
    setIsEditing(false);
  };

  // ❌ 編集のキャンセル
  const handleEditCancel = () => {
    setEditText(todo.text);
    setEditError(null);
    setIsEditing(false);
  };

  // ⌨️ キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // 🔄 優先度の循環変更
  const handlePriorityClick = () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(todo.priority || 'medium');
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdatePriority(todo.id, priorities[nextIndex]);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200
                  dark:border-gray-700 p-4 cursor-move transition-all duration-200
                  hover:shadow-md ${isDragging ? 'opacity-50 rotate-2' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* 📋 優先度バッジ */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePriorityClick}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                     border transition-colors hover:opacity-80 ${getPriorityStyle(todo.priority || 'medium')}`}
          title="クリックで優先度を変更"
        >
          {getPriorityIcon(todo.priority || 'medium')}
          {(todo.priority || 'medium').toUpperCase()}
        </button>

        {/* 🛠️ アクションボタン */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleEditStart}
            className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500
                       dark:hover:text-blue-400 transition-colors rounded"
            title="編集"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDeleteTodo(todo.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500
                       dark:hover:text-red-400 transition-colors rounded"
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 📝 タスク内容 */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              if (editError) setEditError(null);
            }}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border rounded
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-none ${editError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            rows={3}
            autoFocus
          />
          {/* 🚩 エラーメッセージの表示 */}
          {editError && (
            <p className="text-red-500 dark:text-red-400 text-xs">{editError}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm
                         hover:bg-blue-600 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm
                         hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
          {todo.text}
        </div>
      )}

      {/* 📅 作成日時 */}
      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(todo.createdAt).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
