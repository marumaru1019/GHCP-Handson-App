'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className = '' }: ThemeToggleButtonProps) {
  const { theme, toggleTheme, isInitialized } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 📝 コンポーネントマウント後に表示（SSR対応）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 📝 SSRとマウント完了まで何も表示しない
  if (!mounted || !isInitialized) {
    return null;
  }

  // 📝 キーボード操作ハンドラー
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
        border border-gray-300 dark:border-gray-600
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:ring-offset-2
        hover:shadow-md hover:scale-105
        ${className}
      `}
      title={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
      aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
    >
      <span className="text-xl">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
