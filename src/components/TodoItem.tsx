'use client';

import { useState } from 'react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
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

  return (
    <div className={`flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg
                     bg-gray-50 dark:bg-gray-700 transition-all duration-200
                     ${todo.completed ? 'opacity-75' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}        className="w-5 h-5 text-[#ff0033] bg-gray-100 border-gray-300 rounded 
                   focus:ring-[#ff0033] dark:focus:ring-[#ff4d6e] dark:ring-offset-gray-800 
                   focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyDown}
          autoFocus          className="flex-1 px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600
                     border border-gray-300 dark:border-gray-500 rounded focus:outline-none 
                     focus:ring-2 focus:ring-[#ff0033]"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 cursor-text select-none ${
            todo.completed 
              ? 'line-through text-gray-500 dark:text-gray-400' 
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {todo.text}
        </span>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}          className="px-3 py-1 text-sm text-[#ff0033] dark:text-[#ff4d6e] hover:bg-[#fff0f3] 
                     dark:hover:bg-[#4d000f] rounded transition-colors duration-200"
        >
          {isEditing ? 'キャンセル' : '編集'}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 
                     dark:hover:bg-red-900 rounded transition-colors duration-200"
        >
          削除
        </button>
      </div>
    </div>
  );
}
