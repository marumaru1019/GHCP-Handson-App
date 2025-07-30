import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggleButton } from '../ThemeToggleButton';
import { Theme } from '@/hooks/useTheme';

// 📝 useThemeフックのモック
const mockToggleTheme = jest.fn();
const mockSetTheme = jest.fn();
const mockUseTheme = {
  theme: 'light' as Theme,
  toggleTheme: mockToggleTheme,
  setTheme: mockSetTheme,
  isInitialized: true,
};

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
}));

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.theme = 'light';
    mockUseTheme.isInitialized = true;
  });

  // 📝 基本的な表示テスト
  describe('表示', () => {
    it('初期化が完了していない場合は何も表示しない', () => {
      mockUseTheme.isInitialized = false;
      const { container } = render(<ThemeToggleButton />);
      expect(container.firstChild).toBeNull();
    });

    it('ライトモード時は月のアイコンを表示する', () => {
      mockUseTheme.theme = 'light';
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🌙');
      expect(button).toHaveAttribute('title', 'ダークモードに切り替え');
      expect(button).toHaveAttribute('aria-label', 'ダークモードに切り替え');
    });

    it('ダークモード時は太陽のアイコンを表示する', () => {
      mockUseTheme.theme = 'dark';
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('☀️');
      expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
      expect(button).toHaveAttribute('aria-label', 'ライトモードに切り替え');
    });

    it('正しいスタイルクラスが適用される', () => {
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'flex', 'items-center', 'justify-center',
        'w-10', 'h-10', 'rounded-full',
        'bg-gray-100', 'hover:bg-gray-200',
        'dark:bg-gray-700', 'dark:hover:bg-gray-600',
        'border', 'border-gray-300', 'dark:border-gray-600',
        'transition-all', 'duration-200', 'ease-in-out'
      );
    });

    it('カスタムクラス名が適用される', () => {
      const customClass = 'custom-class';
      render(<ThemeToggleButton className={customClass} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(customClass);
    });
  });

  // 📝 インタラクションテスト（要件のコア機能）
  describe('テーマ切り替え機能', () => {
    it('🌙ボタンクリックでテーマ切り替えが動作する', async () => {
      const user = userEvent.setup();
      mockUseTheme.theme = 'light';
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');

      // 📝 ライトモード時は月アイコンが表示されることを確認
      expect(button).toHaveTextContent('🌙');

      // 📝 ボタンクリックでtoggleThemeが呼ばれることを確認
      await user.click(button);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('☀️ボタンクリックでテーマ切り替えが動作する', async () => {
      const user = userEvent.setup();
      mockUseTheme.theme = 'dark';
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');

      // 📝 ダークモード時は太陽アイコンが表示されることを確認
      expect(button).toHaveTextContent('☀️');

      // 📝 ボタンクリックでtoggleThemeが呼ばれることを確認
      await user.click(button);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('テーマ変更時に適切なアイコンが即座に表示される', () => {
      // 📝 ライトモードで開始
      mockUseTheme.theme = 'light';
      const { rerender } = render(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toHaveTextContent('🌙');

      // 📝 ダークモードに変更
      mockUseTheme.theme = 'dark';
      rerender(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toHaveTextContent('☀️');

      // 📝 ライトモードに戻す
      mockUseTheme.theme = 'light';
      rerender(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toHaveTextContent('🌙');
    });

    it('連続クリックが正常に処理される', async () => {
      const user = userEvent.setup();
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');

      // 📝 連続でクリック
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });
  });

  // 📝 キーボード操作テスト
  describe('キーボード操作', () => {
    it('Enterキーで切り替わる', async () => {
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('Spaceキーで切り替わる', async () => {
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('その他のキーでは切り替わらない', async () => {
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'Tab' });

      expect(mockToggleTheme).not.toHaveBeenCalled();
    });
  });

  // 📝 アクセシビリティテスト
  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定される', () => {
      // 📝 ライトモード時
      mockUseTheme.theme = 'light';
      const { rerender } = render(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ダークモードに切り替え');

      // 📝 ダークモード時
      mockUseTheme.theme = 'dark';
      rerender(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ライトモードに切り替え');
    });

    it('titleとaria-labelが一致する', () => {
      // 📝 ライトモード時
      mockUseTheme.theme = 'light';
      const { rerender } = render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('title')).toBe(button.getAttribute('aria-label'));

      // 📝 ダークモード時
      mockUseTheme.theme = 'dark';
      rerender(<ThemeToggleButton />);

      expect(button.getAttribute('title')).toBe(button.getAttribute('aria-label'));
    });

    it('フォーカス可能である', () => {
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it('適切なroleが設定されている', () => {
      render(<ThemeToggleButton />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // 📝 パフォーマンステスト
  describe('パフォーマンス', () => {
    it('高速クリックでも安定動作する', async () => {
      const user = userEvent.setup();
      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');

      // 📝 短時間で複数回クリック
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(user.click(button));
      }

      await Promise.all(promises);
      expect(mockToggleTheme).toHaveBeenCalledTimes(10);
    });

    it('プロップス変更時も正常に再レンダリングされる', () => {
      const { rerender } = render(<ThemeToggleButton className="class1" />);

      expect(screen.getByRole('button')).toHaveClass('class1');

      rerender(<ThemeToggleButton className="class2" />);

      expect(screen.getByRole('button')).toHaveClass('class2');
      expect(screen.getByRole('button')).not.toHaveClass('class1');
    });
  });

  // 📝 エラー状態テスト
  describe('エラーハンドリング', () => {
    it('toggleTheme関数がエラーを投げても画面が壊れない', async () => {
      const user = userEvent.setup();
      mockToggleTheme.mockImplementation(() => {
        throw new Error('Toggle error');
      });

      render(<ThemeToggleButton />);

      const button = screen.getByRole('button');

      // 📝 エラーが発生してもボタンは表示され続ける
      expect(() => user.click(button)).not.toThrow();
      expect(button).toBeInTheDocument();
    });
  });
});
