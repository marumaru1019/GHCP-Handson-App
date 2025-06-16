'use client';

import { TodoFilter as TodoFilterType } from '@/types/todo';

interface TodoFilterProps {
  currentFilter: TodoFilterType;
  onFilterChange: (filter: TodoFilterType) => void;
  activeTodosCount: number;
  completedTodosCount: number;
  onClearCompleted: () => void;
}

export function TodoFilter({ 
  currentFilter, 
  onFilterChange, 
  activeTodosCount, 
  completedTodosCount,
  onClearCompleted 
}: TodoFilterProps) {
  const filters: { key: TodoFilterType; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'active', label: 'アクティブ' },
    { key: 'completed', label: '完了済み' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentFilter === key
                ? 'bg-white dark:bg-gray-600 text-[#ff0033] dark:text-[#ff4d6e] shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {label}
            {key === 'active' && activeTodosCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {activeTodosCount}
              </span>
            )}
            {key === 'completed' && completedTodosCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                {completedTodosCount}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {completedTodosCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 
                     dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
        >
          完了済みを削除
        </button>
      )}
    </div>
  );
}
