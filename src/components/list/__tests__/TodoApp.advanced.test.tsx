import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../TodoApp';

// 📝 localStorage のモック
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// 📝 window.confirm のモック
const mockConfirm = jest.fn();

// 📝 crypto.randomUUID のモック
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mocked-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// 📝 console のモック
const mockConsoleError = jest.fn();
const mockConsoleLog = jest.fn();

describe('TodoApp - エラーハンドリングと拡張機能', () => {
  beforeEach(() => {
    // 📝 各テスト前にモックをリセット
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'confirm', { value: mockConfirm });
    jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
    jest.spyOn(console, 'log').mockImplementation(mockConsoleLog);
  });

  afterEach(() => {
    // 📝 各テスト後にモックを復元
    jest.restoreAllMocks();
  });

  // 📝 エラーハンドリングテスト
  describe('エラーハンドリング', () => {
    it('localStorageからの読み込み失敗時にエラーログが出力される', async () => {
      // 📝 localStorage.getItem でエラーを発生させる
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access failed');
      });

      render(<TodoApp />);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'ローカルストレージからのデータ読み込みに失敗しました:',
          expect.any(Error)
        );
      });
    });

    it('localStorageへの保存失敗時にエラーログが出力される', async () => {
      // 📝 localStorage.setItem でエラーを発生させる
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage save failed');
      });

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 新しいTodoを追加してlocalStorage保存をトリガー
      const input = screen.getByPlaceholderText('新しいタスクを入力してください...');
      await user.type(input, 'テストタスク');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          '❌ TodoApp: ローカルストレージへのデータ保存に失敗しました:',
          expect.any(Error)
        );
      });
    });

    it('フィルター設定の保存失敗時にエラーログが出力される', async () => {
      // 📝 フィルター保存時のエラー
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockImplementation((key) => {
        if (key === 'todoFilter') {
          throw new Error('Filter save failed');
        }
      });

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 フィルターを変更
      const activeFilter = screen.getByText('アクティブ');
      await user.click(activeFilter);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'フィルター設定の保存に失敗しました:',
          expect.any(Error)
        );
      });
    });
  });

  // 📝 データクリア機能テスト
  describe('データクリア機能', () => {
    beforeEach(() => {
      // 📝 初期データを設定
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'todos') {
          return JSON.stringify([
            {
              id: 'test-1',
              text: 'テストタスク1',
              completed: false,
              createdAt: new Date().toISOString(),
              status: 'todo',
              priority: 'medium'
            }
          ]);
        }
        return null;
      });
    });

    it('confirm=trueでデータが全削除される', async () => {
      mockConfirm.mockReturnValue(true);

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 初期データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      });

      // 📝 「全データクリア」ボタンを探す
      const clearButton = screen.getByText('全データクリア');
      await user.click(clearButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'すべてのデータを削除しますか？この操作は元に戻せません。'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('todoFilter');
    });

    it('confirm=falseでデータが保持される', async () => {
      mockConfirm.mockReturnValue(false);

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 初期データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      });

      // 📝 「全データクリア」ボタンをクリック
      const clearButton = screen.getByText('全データクリア');
      await user.click(clearButton);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();

      // 📝 データが残っていることを確認
      expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    });

    it('localStorage削除時のエラーハンドリング', async () => {
      mockConfirm.mockReturnValue(true);
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 初期データが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('テストタスク1')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('全データクリア');
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          '❌ TodoApp: ローカルストレージのクリアに失敗しました:',
          expect.any(Error)
        );
      });
    });
  });

  // 📝 優先度・ステータス更新テスト
  describe('優先度・ステータス更新', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'todos') {
          return JSON.stringify([
            {
              id: 'test-1',
              text: 'テストタスク',
              completed: false,
              createdAt: new Date().toISOString(),
              status: 'todo',
              priority: 'medium'
            }
          ]);
        }
        return null;
      });
    });

    it('優先度が正しく更新される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 優先度ボタンをクリック（medium → high）
      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      // 📝 HIGHに変更されることを確認
      await waitFor(() => {
        expect(screen.getByText('HIGH')).toBeInTheDocument();
      });
    });

    it('ステータス更新時にcompletedフラグも同期される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 ステータスボタンを2回クリック（todo → in-progress → done）
      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton); // todo → in-progress
      await user.click(statusButton); // in-progress → done

      // 📝 「完了」ステータスになり、チェックボックスもチェック済みになることを確認
      await waitFor(() => {
        expect(screen.getByText('完了')).toBeInTheDocument();
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
      });
    });
  });

  // 📝 データ復元機能テスト
  describe('データ復元機能', () => {
    it('既存データの互換性処理が正しく動作する', async () => {
      // 📝 status や priority が未定義の古いデータ形式
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'todos') {
          return JSON.stringify([
            {
              id: 'old-1',
              text: '古いタスク（完了）',
              completed: true,
              createdAt: new Date().toISOString()
              // status, priority は未定義
            },
            {
              id: 'old-2',
              text: '古いタスク（未完了）',
              completed: false,
              createdAt: new Date().toISOString()
              // status, priority は未定義
            }
          ]);
        }
        return null;
      });

      render(<TodoApp />);

      // 📝 古いデータが正しく変換されて表示される
      await waitFor(() => {
        expect(screen.getByText('古いタスク（完了）')).toBeInTheDocument();
        expect(screen.getByText('古いタスク（未完了）')).toBeInTheDocument();
      });

      // 📝 デフォルト値が適用されることを確認
      expect(screen.getAllByText('MEDIUM')).toHaveLength(2); // priority デフォルト
      expect(screen.getByText('完了')).toBeInTheDocument(); // completed=true → status='done'
      expect(screen.getByText('未着手')).toBeInTheDocument(); // completed=false → status='todo'
    });

    it('日付オブジェクトが正しく復元される', async () => {
      const testDate = new Date('2024-01-01T10:00:00.000Z');
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'todos') {
          return JSON.stringify([
            {
              id: 'date-test',
              text: '日付テスト',
              completed: false,
              createdAt: testDate.toISOString(), // 📝 文字列として保存
              status: 'todo',
              priority: 'medium'
            }
          ]);
        }
        return null;
      });

      render(<TodoApp />);

      // 📝 相対時間表示が正しく動作することを確認
      await waitFor(() => {
        expect(screen.getByText('日付テスト')).toBeInTheDocument();
        // 📝 日付のツールチップ確認
        const dateElement = screen.getByTitle(/2024年1月1日/);
        expect(dateElement).toBeInTheDocument();
      });
    });
  });

  // 📝 統合テスト
  describe('統合テスト', () => {
    it('複数の機能を組み合わせた操作が正常に動作する', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 1. タスク追加
      const input = screen.getByPlaceholderText('新しいタスクを入力してください...');
      await user.type(input, '統合テストタスク');

      const addButton = screen.getByText('追加');
      await user.click(addButton);

      // 📝 タスクが追加されるまで待機
      await waitFor(() => {
        expect(screen.getByText('統合テストタスク')).toBeInTheDocument();
      });

      // 📝 2. 優先度変更
      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      // 📝 3. ステータス変更
      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      // 📝 4. 編集
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      const textarea = screen.getByDisplayValue('統合テストタスク');
      await user.clear(textarea);
      await user.type(textarea, '編集済み統合テストタスク');
      await user.keyboard('{Enter}');

      // 📝 5. フィルター変更
      const activeFilter = screen.getByText('アクティブ');
      await user.click(activeFilter);

      // 📝 結果確認
      await waitFor(() => {
        expect(screen.getByText('編集済み統合テストタスク')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('進行中')).toBeInTheDocument();
      });
    });
  });
});
