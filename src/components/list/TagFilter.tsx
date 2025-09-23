'use client';

import { Tag, X } from 'lucide-react';

interface TagFilterProps {
  availableTags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ availableTags, selectedTag, onTagSelect }: TagFilterProps) {
  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          タグでフィルタ:
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* 全て表示ボタン */}
        <button
          onClick={() => onTagSelect(null)}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                     border transition-colors ${
            selectedTag === null
              ? 'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
          }`}
        >
          すべて
        </button>

        {/* タグボタン */}
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag === selectedTag ? null : tag)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                       border transition-colors ${
              selectedTag === tag
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30'
            }`}
          >
            {tag}
            {selectedTag === tag && (
              <X size={12} className="ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}