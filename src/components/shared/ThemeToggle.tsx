'use client';

import React from 'react';
import { useTheme, Theme } from '@/hooks/useTheme';
import { ThemeIcon } from './ThemeIcon';

/**
 * テーマ切り替えトグルコンポーネント
 * ライト → ダーク → システム の順番でサイクル
 * アクセシビリティ対応（ARIA属性、キーボード操作）
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeToggle();
    }
  };

  const getThemeLabel = (currentTheme: Theme): string => {
    switch (currentTheme) {
      case 'light':
        return 'ライトモード';
      case 'dark':
        return 'ダークモード';
      case 'system':
        return 'システム設定';
      default:
        return 'テーマ切り替え';
    }
  };

  const getNextThemeLabel = (currentTheme: Theme): string => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    return getThemeLabel(themes[nextIndex]);
  };

  return (
    <button
      onClick={handleThemeToggle}
      onKeyDown={handleKeyDown}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff0033] 
                 dark:focus:ring-[#ff4d6e] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`現在: ${getThemeLabel(theme)} (${resolvedTheme === 'dark' ? 'ダーク表示' : 'ライト表示'}), クリックで${getNextThemeLabel(theme)}に変更`}
      title={`テーマ切り替え: 現在 ${getThemeLabel(theme)}, 次は ${getNextThemeLabel(theme)}`}
      type="button"
    >
      <ThemeIcon theme={theme} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  );
}