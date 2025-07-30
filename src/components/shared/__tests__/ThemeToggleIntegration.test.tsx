import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggleButton } from '../ThemeToggleButton';

// 📝 実際のuseThemeフックを使用する統合テスト
// （モックを使わずに実際の動作をテスト）

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

// 📝 window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('ThemeToggleButton 統合テスト', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    document.documentElement.classList.remove('dark');
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  // 📝 要件1: ボタンクリックでテーマ切り替えが動作すること
  describe('テーマ切り替え動作', () => {
    it('🌙ボタンクリックでライト→ダークに切り替わる', async () => {
      const user = userEvent.setup();

      // 📝 初期化完了まで待機
      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 初期状態はライトモード（月アイコン）
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('title', 'ダークモードに切り替え');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 ボタンクリック
      await user.click(button);

      // 📝 ダークモードに切り替わったことを確認
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(mockLocalStorage.getItem('theme')).toBe('dark');
    });

    it('☀️ボタンクリックでダーク→ライトに切り替わる', async () => {
      const user = userEvent.setup();

      // 📝 事前にダークモードを設定
      mockLocalStorage.setItem('theme', 'dark');

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 初期状態はダークモード（太陽アイコン）
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 ボタンクリック
      await user.click(button);

      // 📝 ライトモードに切り替わったことを確認
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('title', 'ダークモードに切り替え');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(mockLocalStorage.getItem('theme')).toBe('light');
    });
  });

  // 📝 要件2: ボタンクリック時に画面全体のテーマが即座に変更されること
  describe('即座のテーマ変更', () => {
    it('クリック直後にDOM要素のクラスが変更される', async () => {
      const user = userEvent.setup();

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 初期状態の確認
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 クリック前後でのDOM変更を確認
      await user.click(button);

      // 📝 即座にdarkクラスが追加されることを確認
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('複数回クリックでも即座に反映される', async () => {
      const user = userEvent.setup();

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 初期状態
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 1回目のクリック（ライト → ダーク）
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 2回目のクリック（ダーク → ライト）
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // 📝 3回目のクリック（ライト → ダーク）
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('高速クリックでも正確に状態が更新される', async () => {
      const user = userEvent.setup();

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 高速で5回クリック
      for (let i = 0; i < 5; i++) {
        await user.click(button);
      }

      // 📝 最終的にダークモードになっているはず（奇数回のクリック）
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(button).toHaveTextContent('☀️');
    });
  });

  // 📝 要件3: 現在のモードに応じてアイコンが正しく表示されること
  describe('アイコン表示の正確性', () => {
    it('ライトモード時は🌙アイコンが表示される', async () => {
      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 ライトモード時のアイコンとラベル
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('aria-label', 'ダークモードに切り替え');
      expect(button).toHaveAttribute('title', 'ダークモードに切り替え');
    });

    it('ダークモード時は☀️アイコンが表示される', async () => {
      mockLocalStorage.setItem('theme', 'dark');

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 ダークモード時のアイコンとラベル
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('aria-label', 'ライトモードに切り替え');
      expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
    });

    it('テーマ切り替え後にアイコンが即座に更新される', async () => {
      const user = userEvent.setup();

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 初期状態（ライトモード）
      expect(button).toHaveTextContent('🌙');

      // 📝 ダークモードに切り替え
      await user.click(button);
      expect(button).toHaveTextContent('☀️');

      // 📝 ライトモードに戻す
      await user.click(button);
      expect(button).toHaveTextContent('🌙');
    });

    it('アイコンとアクセシビリティ属性が常に一致する', async () => {
      const user = userEvent.setup();

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 ライトモード時
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('aria-label', 'ダークモードに切り替え');
      expect(button).toHaveAttribute('title', 'ダークモードに切り替え');

      // 📝 ダークモードに切り替え
      await user.click(button);
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('aria-label', 'ライトモードに切り替え');
      expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
    });
  });

  // 📝 永続化と復元のテスト
  describe('状態の永続化', () => {
    it('設定したテーマが保存され、再初期化時に復元される', async () => {
      const user = userEvent.setup();

      // 📝 最初のコンポーネントレンダリング
      const { unmount } = render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let button = screen.getByRole('button');

      // 📝 ダークモードに切り替え
      await user.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 コンポーネントをアンマウント
      unmount();

      // 📝 DOM状態をリセット
      document.documentElement.classList.remove('dark');

      // 📝 再度レンダリング
      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      button = screen.getByRole('button');

      // 📝 保存されたダークモードが復元されることを確認
      expect(button).toHaveTextContent('☀️');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // 📝 エラー耐性テスト
  describe('エラー耐性', () => {
    it('ローカルストレージエラー時でもUI操作は正常動作する', async () => {
      const user = userEvent.setup();

      // 📝 ローカルストレージでエラーを発生させる
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      render(<ThemeToggleButton />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const button = screen.getByRole('button');

      // 📝 エラーが発生してもクリックは動作する
      await user.click(button);
      expect(button).toHaveTextContent('☀️');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // 📝 ローカルストレージを元に戻す
      mockLocalStorage.setItem = originalSetItem;
    });
  });
});
