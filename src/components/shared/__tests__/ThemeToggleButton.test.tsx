import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggleButton } from '../ThemeToggleButton';

// 📝 useThemeフックのモック
const mockToggleTheme = jest.fn();
const mockUseTheme = {
  theme: 'light' as const,
  toggleTheme: mockToggleTheme,
  setTheme: jest.fn(),
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
  });

  it('ダークモード時は太陽のアイコンを表示する', () => {
    mockUseTheme.theme = 'dark';
    render(<ThemeToggleButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('☀️');
    expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
  });

  it('ボタンクリックでテーマが切り替わる', async () => {
    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('キーボード操作で切り替わる', () => {
    render(<ThemeToggleButton />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('正しいスタイルクラスが適用される', () => {
    render(<ThemeToggleButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'w-10', 'h-10', 'rounded-full');
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-class';
    render(<ThemeToggleButton className={customClass} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('適切なaria-labelが設定される', () => {
    // ライトモード時
    mockUseTheme.theme = 'light';
    const { rerender } = render(<ThemeToggleButton />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ダークモードに切り替え');

    // ダークモード時
    mockUseTheme.theme = 'dark';
    rerender(<ThemeToggleButton />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ライトモードに切り替え');
  });
});
