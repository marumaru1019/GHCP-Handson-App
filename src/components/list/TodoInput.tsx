'use client';

import { useState } from 'react';

interface TodoInputProps {
  onAddTodo: (text: string, tags?: string[]) => void;
}

export function TodoInput({ onAddTodo }: TodoInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [tagsValue, setTagsValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const tags = tagsValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      onAddTodo(inputValue, tags.length > 0 ? tags : undefined);
      setInputValue('');
      setTagsValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="新しいタスクを入力してください..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-6 py-2 bg-[#ff0033] hover:bg-[#e6002e] disabled:bg-gray-300 dark:disabled:bg-gray-600
                     text-white rounded-lg font-medium transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:ring-offset-2
                     disabled:cursor-not-allowed"
        >
          追加
        </button>
      </div>
      <input
        type="text"
        value={tagsValue}
        onChange={(e) => setTagsValue(e.target.value)}
        placeholder="タグをカンマ区切りで入力 (例: 仕事, 開発, 個人)"
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400 text-sm"
      />
    </form>
  );
}
