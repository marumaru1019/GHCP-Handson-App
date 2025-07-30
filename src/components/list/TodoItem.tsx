'use client';

import { useState } from 'react';
import { Todo, Priority, TodoStatus } from '@/types';
import { getRelativeTime, getDetailedDateTime } from '@/utils';
import { AlertCircle, Circle, CheckCircle, Edit3, Trash2 } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRequestDelete: (id: string, title: string) => void; // 📝 削除確認モーダル表示用
  onEdit: (id: string, newText: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateStatus: (id: string, status: TodoStatus) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onRequestDelete, // 📝 削除確認モーダル表示用
  onEdit,
  onUpdatePriority,
  onUpdateStatus
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, editText);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

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

  // 📊 ステータスに応じたスタイルを取得
  const getStatusStyle = (status: TodoStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // 🔄 優先度の循環変更
  const handlePriorityClick = () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(todo.priority || 'medium');
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdatePriority(todo.id, priorities[nextIndex]);
  };

  // 🔄 ステータスの循環変更
  const handleStatusClick = () => {
    const statuses: TodoStatus[] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(todo.status || 'todo');
    const nextIndex = (currentIndex + 1) % statuses.length;
    onUpdateStatus(todo.id, statuses[nextIndex]);
  };

  return (
    <div className={`flex flex-col gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg
                     bg-gray-50 dark:bg-gray-700 transition-all duration-200
                     ${todo.completed ? 'opacity-75' : ''}`}>

      {/* 📋 上部：チェックボックス、バッジ、アクションボタン */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 text-[#ff0033] bg-gray-100 border-gray-300 rounded
                     focus:ring-[#ff0033] dark:focus:ring-[#ff4d6e] dark:ring-offset-gray-800
                     focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />

        {/* 🏷️ 優先度バッジ */}
        <button
          onClick={handlePriorityClick}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                     border transition-colors hover:opacity-80 ${getPriorityStyle(todo.priority || 'medium')}`}
          title="クリックで優先度を変更"
        >
          {getPriorityIcon(todo.priority || 'medium')}
          {(todo.priority || 'medium').toUpperCase()}
        </button>

        {/* 📊 ステータスバッジ */}
        <button
          onClick={handleStatusClick}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                     border transition-colors hover:opacity-80 ${getStatusStyle(todo.status || 'todo')}`}
          title="クリックでステータスを変更"
        >
          {(todo.status || 'todo') === 'todo' && '未着手'}
          {(todo.status || 'todo') === 'in-progress' && '進行中'}
          {(todo.status || 'todo') === 'done' && '完了'}
        </button>

        {/* 🛠️ アクションボタン */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500
                       dark:hover:text-blue-400 transition-colors rounded"
            title="編集"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onRequestDelete(todo.id, todo.text)} // 📝 確認モーダル表示に変更
            className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500
                       dark:hover:text-red-400 transition-colors rounded"
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 📝 下部：テキスト編集エリア */}
      {isEditing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded
                     bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-[#ff0033] focus:border-transparent
                     resize-none"
          rows={2}
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`cursor-text select-none p-2 rounded border-2 border-transparent
                     hover:border-gray-300 dark:hover:border-gray-500 transition-colors ${
            todo.completed
              ? 'line-through text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {todo.text}
        </div>
      )}

      {/* 📅 作成日時 */}
      <div
        className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2 border-gray-200 dark:border-gray-600"
        title={getDetailedDateTime(todo.createdAt)}
      >
        {getRelativeTime(todo.createdAt)}
      </div>
    </div>
  );
}
