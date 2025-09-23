'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * カスタムフック: テーマ管理
 * ライト/ダーク/システムテーマの切り替えと永続化を行う
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // システムのダークモード設定を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const currentTheme = stored || 'system';
      setThemeState(currentTheme);
      
      const systemDark = mediaQuery.matches;
      const resolved: ResolvedTheme = currentTheme === 'system' 
        ? (systemDark ? 'dark' : 'light')
        : currentTheme === 'dark' ? 'dark' : 'light';
      
      setResolvedTheme(resolved);
      
      // DOM更新
      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.dataset.theme = currentTheme;
    };

    // 初期化
    updateResolvedTheme();
    
    // システムテーマ変更の監視
    mediaQuery.addEventListener('change', updateResolvedTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateResolvedTheme);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      setThemeState(newTheme);
      
      // 即座にresolvedThemeを更新
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved: ResolvedTheme = newTheme === 'system' 
        ? (systemDark ? 'dark' : 'light')
        : newTheme === 'dark' ? 'dark' : 'light';
      
      setResolvedTheme(resolved);
      
      // DOM更新
      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.dataset.theme = newTheme;
    } catch (error) {
      console.error('テーマの保存に失敗しました:', error);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}