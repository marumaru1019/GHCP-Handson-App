import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchApp } from '../SearchApp';

// 📝 localStorage のモック
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// 📝 globalのlocalStorageをモック
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('SearchApp - 検索機能テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('🔍 検索ボックス機能', () => {
    it('検索ボックスに文字を入力すると検索結果が更新される', async () => {
      // 📝 テストデータ
      const testTodos = [
        {
          id: 'test-1',
          text: 'プロジェクト企画書作成',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'API設計ドキュメント',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'in-progress',
          priority: 'medium'
        },
        {
          id: 'test-3',
          text: 'テストコード実装',
          completed: true,
          createdAt: new Date().toISOString(),
          status: 'done',
          priority: 'low'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      // 📝 初期状態：すべてのTodoが表示される
      await waitFor(() => {
        expect(screen.getByText('プロジェクト企画書作成')).toBeInTheDocument();
        expect(screen.getByText('API設計ドキュメント')).toBeInTheDocument();
        expect(screen.getByText('テストコード実装')).toBeInTheDocument();
      });

      // 📝 検索ボックスを取得
      const searchInput = screen.getByPlaceholderText('Todoを検索...');

      // 📝 「プロジェクト」で検索
      await user.type(searchInput, 'プロジェクト');

      // 🐞 この段階で検索結果が更新されるかを確認
      await waitFor(() => {
        // 📊 マッチするTodoのみ表示される
        expect(screen.getByText('プロジェクト企画書作成')).toBeInTheDocument();

        // 📊 マッチしないTodoは表示されない
        expect(screen.queryByText('API設計ドキュメント')).not.toBeInTheDocument();
        expect(screen.queryByText('テストコード実装')).not.toBeInTheDocument();
      });
    });

    it('検索文字列をクリアすると全件表示に戻る', async () => {
      // 📝 テストデータ
      const testTodos = [
        {
          id: 'test-1',
          text: 'タスクA',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'タスクB',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'medium'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      // 📝 初期状態
      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
        expect(screen.getByText('タスクB')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Todoを検索...');

      // 📝 検索実行
      await user.type(searchInput, 'タスクA');

      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
        expect(screen.queryByText('タスクB')).not.toBeInTheDocument();
      });

      // 📝 検索文字列をクリア
      await user.clear(searchInput);

      // 📝 全件表示に戻る
      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
        expect(screen.getByText('タスクB')).toBeInTheDocument();
      });
    });

    it('部分一致検索が正しく動作する', async () => {
      // 📝 テストデータ
      const testTodos = [
        {
          id: 'test-1',
          text: 'フロントエンド開発',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'バックエンド開発',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'medium'
        },
        {
          id: 'test-3',
          text: 'デザイン作成',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'low'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      await waitFor(() => {
        expect(screen.getByText('フロントエンド開発')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Todoを検索...');

      // 📝 「開発」で部分検索
      await user.type(searchInput, '開発');

      await waitFor(() => {
        // 📊 「開発」を含むTodoが表示される
        expect(screen.getByText('フロントエンド開発')).toBeInTheDocument();
        expect(screen.getByText('バックエンド開発')).toBeInTheDocument();

        // 📊 「開発」を含まないTodoは表示されない
        expect(screen.queryByText('デザイン作成')).not.toBeInTheDocument();
      });
    });

    it('大文字小文字を区別しない検索が動作する', async () => {
      const testTodos = [
        {
          id: 'test-1',
          text: 'JavaScript学習',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'Python練習',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'medium'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      await waitFor(() => {
        expect(screen.getByText('JavaScript学習')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Todoを検索...');

      // 📝 小文字で検索
      await user.type(searchInput, 'javascript');

      await waitFor(() => {
        // 📊 大文字小文字を区別せずマッチする
        expect(screen.getByText('JavaScript学習')).toBeInTheDocument();
        expect(screen.queryByText('Python練習')).not.toBeInTheDocument();
      });
    });
  });

  describe('� リセット機能', () => {
    it('リセットボタンを押すとすべてのフィルターとソート順がリセットされる', async () => {
      const testTodos = [
        {
          id: 'test-1',
          text: 'タスクA',
          completed: false,
          createdAt: new Date(Date.now() - 60000).toISOString(), // 1分前
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'タスクB',
          completed: true,
          createdAt: new Date().toISOString(), // 現在
          status: 'done',
          priority: 'low'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
      });

      // 📝 検索クエリを設定
      const searchInput = screen.getByPlaceholderText('Todoを検索...');
      await user.type(searchInput, 'タスクA');

      // 📝 優先度フィルターを変更
      const prioritySelect = screen.getByDisplayValue('すべての優先度');
      await user.selectOptions(prioritySelect, 'high');

      // 📝 ステータスフィルターを変更  
      const statusSelect = screen.getByDisplayValue('すべてのステータス');
      await user.selectOptions(statusSelect, 'todo');

      // 📝 ソート順を変更
      const sortSelect = screen.getByDisplayValue('新しい順');
      await user.selectOptions(sortSelect, 'alphabetical');

      // 📝 設定が変更されたことを確認
      expect(searchInput).toHaveValue('タスクA');
      expect(prioritySelect).toHaveValue('high');
      expect(statusSelect).toHaveValue('todo');
      expect(sortSelect).toHaveValue('alphabetical');

      // 📝 リセットボタンをクリック
      const resetButton = screen.getByText('リセット');
      await user.click(resetButton);

      // 📝 すべての設定がリセットされることを確認
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(prioritySelect).toHaveValue('all');
        expect(statusSelect).toHaveValue('all');
        expect(sortSelect).toHaveValue('newest'); // 📝 ソート順もリセットされる
      });

      // 📝 リセット後は全てのTodoが表示される
      await waitFor(() => {
        expect(screen.getByText('タスクA')).toBeInTheDocument();
        expect(screen.getByText('タスクB')).toBeInTheDocument();
      });
    });
  });

  describe('�🔍 検索と統計の連携', () => {
    it('検索結果に応じて統計が更新される', async () => {
      const testTodos = [
        {
          id: 'test-1',
          text: 'プロジェクトタスク1',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'high'
        },
        {
          id: 'test-2',
          text: 'プロジェクトタスク2',
          completed: true,
          createdAt: new Date().toISOString(),
          status: 'done',
          priority: 'high'
        },
        {
          id: 'test-3',
          text: '通常タスク',
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'todo',
          priority: 'low'
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const user = userEvent.setup();
      render(<SearchApp />);

      await waitFor(() => {
        expect(screen.getByText('プロジェクトタスク1')).toBeInTheDocument();
      });

      // 📝 初期状態の統計確認
      const statsSection = screen.getByTestId('search-stats');
      expect(statsSection).toHaveTextContent('3件'); // 総件数

      const searchInput = screen.getByPlaceholderText('Todoを検索...');

      // 📝 「プロジェクト」で検索
      await user.type(searchInput, 'プロジェクト');

      await waitFor(() => {
        // 📊 検索結果の統計が更新される
        expect(statsSection).toHaveTextContent('2件'); // プロジェクトタスクは2件
        expect(statsSection).toHaveTextContent('2件'); // 高優先度も2件
      });
    });
  });
});
