'use client';

import { useState, useEffect, useCallback, useLayoutEffect } from 'react';

export type Theme = 'light' | 'dark';

// 📝 ローカルストレージのキー
const THEME_STORAGE_KEY = 'theme';

export function useTheme() {
  // 📝 SSR時は常にlight、クライアント側で実際の値に更新
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // 📝 テーマをDOMに適用する関数
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return; // 📝 SSR対応

    const root = document.documentElement;

    console.log('🎨 テーマ適用開始:', newTheme);
    console.log('📝 現在のclass:', root.className);

    if (newTheme === 'dark') {
      root.classList.add('dark');
      console.log('🌙 ダークモードクラス追加完了');
    } else {
      root.classList.remove('dark');
      console.log('☀️ ダークモードクラス削除完了');
    }

    console.log('📝 変更後のclass:', root.className);

    // 📝 ローカルストレージに保存
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      console.log('💾 テーマ保存完了:', newTheme);
    } catch (error) {
      console.error('🚫 テーマの保存に失敗しました:', error);
    }
  }, []);

  // 📝 初回読み込み時にテーマを設定（SSR対応）
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return; // 📝 SSR対応

    try {
      console.log('🚀 useTheme初期化開始');
      // 📦 ローカルストレージから設定を読み込み
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      console.log('📦 保存されたテーマ:', storedTheme);

      let initialTheme: Theme;

      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        // 📝 保存されたテーマがある場合はそれを使用
        initialTheme = storedTheme;
        console.log('✅ 保存されたテーマを使用:', initialTheme);
      } else {
        // 📝 保存されたテーマがない場合はシステム設定を確認
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
        console.log('🖥️ システムテーマを使用:', initialTheme, '(prefers-dark:', prefersDark, ')');
      }

      setTheme(initialTheme);
      applyTheme(initialTheme);
      setIsInitialized(true);
      console.log('✅ useTheme初期化完了:', initialTheme);
    } catch (error) {
      console.error('🚫 テーマの初期化に失敗しました:', error);
      setTheme('light');
      applyTheme('light');
      setIsInitialized(true);
    }
  }, [applyTheme]);

  // 📝 初期化完了フラグを設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInitialized(true);
    }
  }, []);

  // 📝 テーマを切り替える関数
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 テーマ切り替え:', theme, '->', newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  // 📝 特定のテーマに設定する関数
  const setThemeMode = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  return {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isInitialized,
  };
}
