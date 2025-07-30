import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

// 📝 ローカルストレージのモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// 📝 window.matchMediaのモック（動的にマッチ条件を変更可能）
let mockMatchMediaMatches = false;
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: mockMatchMediaMatches,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('useTheme', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMediaMatches = false;
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  // 📝 基本的な初期化テスト
  describe('初期化', () => {
    it('初期状態ではライトモードになる', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化が完了するまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isInitialized).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('保存されたテーマが復元される', async () => {
      // 📝 事前にダークモードを保存
      mockLocalStorage.setItem('theme', 'dark');

      const { result } = renderHook(() => useTheme());

      // 📝 初期化が完了するまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('システムテーマ設定が反映される（ダークモード優先時）', async () => {
      mockMatchMediaMatches = true; // 📝 システムでダークモードが設定されている状態

      const { result } = renderHook(() => useTheme());

      // 📝 初期化が完了するまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('無効なローカルストレージ値の場合はシステム設定にフォールバックする', async () => {
      mockLocalStorage.setItem('theme', 'invalid-theme'); // 📝 無効な値を設定
      mockMatchMediaMatches = true;

      const { result } = renderHook(() => useTheme());

      // 📝 初期化が完了するまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // 📝 テーマ切り替えのテスト
  describe('テーマ切り替え', () => {
    it('toggleTheme関数でライト→ダークに切り替わる', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 初期状態の確認（ライトモード）
      expect(result.current.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 ダークモードに切り替え
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(mockLocalStorage.getItem('theme')).toBe('dark');
    });

    it('toggleTheme関数でダーク→ライトに切り替わる', async () => {
      mockLocalStorage.setItem('theme', 'dark');
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 初期状態の確認（ダークモード）
      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 ライトモードに切り替え
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockLocalStorage.getItem('theme')).toBe('light');
    });

    it('setTheme関数で特定のテーマに設定できる', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 ダークモードに設定
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(mockLocalStorage.getItem('theme')).toBe('dark');

      // 📝 ライトモードに設定
      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockLocalStorage.getItem('theme')).toBe('light');
    });

    it('連続したテーマ切り替えが正常に動作する', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 連続でテーマを切り替え
      act(() => {
        result.current.toggleTheme(); // ライト → ダーク
      });
      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme(); // ダーク → ライト
      });
      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme(); // ライト → ダーク
      });
      expect(result.current.theme).toBe('dark');

      // 📝 最終的にローカルストレージに正しく保存されているか確認
      expect(mockLocalStorage.getItem('theme')).toBe('dark');
    });
  });

  // 📝 DOM操作のテスト
  describe('DOM操作', () => {
    it('ダークモード時にdarkクラスが追加される', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 初期状態でdarkクラスがないことを確認
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 ダークモードに切り替え
      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('ライトモード時にdarkクラスが削除される', async () => {
      // 📝 事前にdarkクラスを追加
      document.documentElement.classList.add('dark');
      mockLocalStorage.setItem('theme', 'dark');

      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 ダークモードから開始されることを確認
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 ライトモードに切り替え
      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('既存のクラスを削除せずにdarkクラスのみを操作する', async () => {
      // 📝 事前に他のクラスを追加
      document.documentElement.classList.add('other-class', 'another-class');

      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 ダークモードに切り替え
      act(() => {
        result.current.setTheme('dark');
      });

      // 📝 darkクラスが追加され、他のクラスは保持されることを確認
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('other-class')).toBe(true);
      expect(document.documentElement.classList.contains('another-class')).toBe(true);

      // 📝 ライトモードに切り替え
      act(() => {
        result.current.setTheme('light');
      });

      // 📝 darkクラスのみが削除され、他のクラスは保持されることを確認
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('other-class')).toBe(true);
      expect(document.documentElement.classList.contains('another-class')).toBe(true);
    });
  });

  // 📝 永続化のテスト
  describe('ローカルストレージ永続化', () => {
    it('テーマ変更時にローカルストレージに保存される', async () => {
      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockLocalStorage.getItem('theme')).toBe('dark');

      act(() => {
        result.current.setTheme('light');
      });

      expect(mockLocalStorage.getItem('theme')).toBe('light');
    });

    it('ローカルストレージエラー時でもアプリケーションが動作する', async () => {
      // 📝 ローカルストレージのsetItemでエラーを発生させる
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 エラーが発生してもテーマ切り替えは動作することを確認
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 ローカルストレージを元に戻す
      mockLocalStorage.setItem = originalSetItem;
    });
  });

  // 📝 エラーハンドリングのテスト
  describe('エラーハンドリング', () => {
    it('初期化時のローカルストレージエラーでもデフォルトテーマで動作する', async () => {
      // 📝 ローカルストレージのgetItemでエラーを発生させる
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem = jest.fn(() => {
        throw new Error('Storage access error');
      });

      const { result } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // 📝 エラーが発生してもライトモードで動作することを確認
      expect(result.current.theme).toBe('light');
      expect(result.current.isInitialized).toBe(true);

      // 📝 ローカルストレージを元に戻す
      mockLocalStorage.getItem = originalGetItem;
    });
  });

  // 📝 パフォーマンステスト
  describe('パフォーマンス', () => {
    it('複数回の初期化でも一度だけ実行される', async () => {
      const { result, rerender } = renderHook(() => useTheme());

      // 📝 初期化完了を待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const initialTheme = result.current.theme;

      // 📝 再レンダリングしても初期化が重複しないことを確認
      rerender();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.theme).toBe(initialTheme);
      expect(result.current.isInitialized).toBe(true);
    });
  });
});
