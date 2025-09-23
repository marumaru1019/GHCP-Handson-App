/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

// matchMediaのモック
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// localStorageのモック
const mockLocalStorage = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

describe('useTheme', () => {
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    // DOM要素のモック
    const mockDocumentElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      dataset: {},
    };
    
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: mockDocumentElement,
    });

    // localStorageのモック
    mockStorage = mockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
    });

    // システムがライトテーマの場合のデフォルト
    mockMatchMedia(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('デフォルトでsystemテーマが設定され、システムがライトの場合resolvedThemeがlightになる', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  test('システムがダークテーマの場合、resolvedThemeがdarkになる', () => {
    mockMatchMedia(true); // システムをダークに設定

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('ライトテーマに設定した場合、テーマとresolvedThemeが更新される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('ダークテーマに設定した場合、darkクラスがdocumentElementに追加される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('ライトテーマに設定した場合、darkクラスがdocumentElementから削除される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  test('保存されたテーマが復元される', () => {
    mockStorage.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  test('データセット属性が正しく設定される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect((document.documentElement.dataset as Record<string, string>).theme).toBe('light');
  });

  test('localStorage保存時のエラーが適切にハンドリングされる', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(consoleSpy).toHaveBeenCalledWith('テーマの保存に失敗しました:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});