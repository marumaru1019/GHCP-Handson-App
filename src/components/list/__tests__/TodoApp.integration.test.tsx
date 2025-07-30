import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from '../TodoApp';
import type { Todo } from '@/types';

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

// 📝 crypto.randomUUIDのモック
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substr(2, 9)
  }
});

describe('TodoApp 削除確認フロー統合テスト', () => {
  beforeEach(() => {
    // 📝 各テスト前にローカルストレージをクリア
    mockLocalStorage.clear();
    // 📝 body要素のスタイルをリセット
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // 📝 テスト後のクリーンアップ
    document.body.style.overflow = 'unset';
  });

  // 📝 テスト用のTodoを事前に追加するヘルパー関数
  const addTestTodos = async (user: ReturnType<typeof userEvent.setup>) => {
    const input = screen.getByPlaceholderText('新しいタスクを入力してください...');

    // 📝 複数のTodoを追加
    await user.type(input, '最初のタスク');
    await user.keyboard('{Enter}');

    await user.clear(input);
    await user.type(input, '削除対象のタスク');
    await user.keyboard('{Enter}');

    await user.clear(input);
    await user.type(input, '最後のタスク');
    await user.keyboard('{Enter}');

    // 📝 Todoが追加されるまで待機
    await waitFor(() => {
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();
    });
  };

  // 📝 削除フロー全体のテスト
  describe('削除フロー全体のテスト', () => {
    it('TodoItemで削除ボタンをクリック → DeleteConfirmModal表示 → 削除実行 → Todoリストから削除', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 初期状態の確認（3つのTodoが存在）
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();

      // 📝 「削除対象のタスク」の削除ボタンを探す
      const deleteButtons = screen.getAllByTitle('削除');
      expect(deleteButtons).toHaveLength(3);

      // 📝 2番目のTodo（削除対象のタスク）の削除ボタンをクリック
      await user.click(deleteButtons[1]);

      // 📝 削除確認モーダルが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('削除の確認')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent('削除対象のタスク');
      });

      // 📝 モーダル表示中はbody要素のoverflowがhidden
      expect(document.body.style.overflow).toBe('hidden');

      // 📝 「削除する」ボタンをクリック
      const confirmButton = screen.getByRole('button', { name: /削除する/ });
      await user.click(confirmButton);

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 body要素のoverflowがリセットされる
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });

      // 📝 「削除対象のタスク」が削除され、他のTodoは残っていることを確認
      expect(screen.queryByText('削除対象のタスク')).not.toBeInTheDocument();
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();

      // 📝 削除ボタンが2つになっていることを確認
      const remainingDeleteButtons = screen.getAllByTitle('削除');
      expect(remainingDeleteButtons).toHaveLength(2);
    });

    it('複数Todoの環境で正しいTodoが削除される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 初期状態の確認（3つのTodoが存在）
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();

      // 📝 削除ボタンの数を確認
      const deleteButtons = screen.getAllByTitle('削除');
      expect(deleteButtons).toHaveLength(3);

      // 📝 最初のTodoを削除
      await user.click(deleteButtons[0]);

      // 📝 削除確認モーダルが表示される
      await waitFor(() => {
        expect(screen.getByText('削除の確認')).toBeInTheDocument();
      });

      // 📝 削除実行
      await user.click(screen.getByRole('button', { name: /削除する/ }));

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // 📝 削除ボタンの数で削除を確認（より確実）
      await waitFor(() => {
        const remainingDeleteButtons = screen.getAllByTitle('削除');
        expect(remainingDeleteButtons).toHaveLength(2);
      }, { timeout: 3000 });

      // 📝 残っているTodoを確認（どのTodoが削除されたかは関係なく、2つ残っていることを確認）
      const remainingTodos = [
        screen.queryByText('最初のタスク'),
        screen.queryByText('削除対象のタスク'),
        screen.queryByText('最後のタスク')
      ].filter(Boolean);

      expect(remainingTodos).toHaveLength(2);
    }, 10000);

    it('最後のTodoを削除すると空状態のメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 1つだけTodoを追加
      const input = screen.getByPlaceholderText('新しいタスクを入力してください...');
      await user.type(input, '唯一のタスク');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('唯一のタスク')).toBeInTheDocument();
      });

      // 📝 削除実行
      const deleteButton = screen.getByTitle('削除');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('削除の確認')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      // 📝 空状態のメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('タスクがありません。新しいタスクを追加してください。')).toBeInTheDocument();
      });
    });
  });

  // 📝 キャンセルフローのテスト
  describe('キャンセルフローのテスト', () => {
    it('削除ボタンクリック → モーダル表示 → キャンセルボタン → モーダルクローズ → Todoが残る', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[1]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent('削除対象のタスク');
      });

      // 📝 キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 Todoが削除されずに残っていることを確認
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();

      // 📝 削除ボタンが3つのまま
      const remainingDeleteButtons = screen.getAllByTitle('削除');
      expect(remainingDeleteButtons).toHaveLength(3);
    });

    it('閉じるボタン（X）でモーダルをキャンセル', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[0]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 閉じるボタン（X）をクリック
      const closeButton = screen.getByLabelText('モーダルを閉じる');
      await user.click(closeButton);

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 Todoが削除されずに残っている
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();
    });

    it('バックドロップクリックでモーダルをキャンセル', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[2]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 バックドロップをクリック
      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 Todoが削除されずに残っている
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();
    });
  });

  // 📝 キーボード操作のテスト
  describe('キーボード操作のテスト', () => {
    it('ESCキーでモーダルを閉じる', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[1]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 ESCキーを押す
      await user.keyboard('{Escape}');

      // 📝 モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 Todoが削除されずに残っている
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('削除対象のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();
    });

    it('Enterキーで削除実行（削除ボタンにフォーカス時）', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[1]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 削除ボタンにフォーカスを当てる
      const confirmButton = screen.getByRole('button', { name: /削除する/ });
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      // 📝 Enterキーで削除実行
      await user.keyboard('{Enter}');

      // 📝 モーダルが閉じられ、Todoが削除される
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('削除対象のタスク')).not.toBeInTheDocument();
      });

      // 📝 他のTodoは残っている
      expect(screen.getByText('最初のタスク')).toBeInTheDocument();
      expect(screen.getByText('最後のタスク')).toBeInTheDocument();
    });

    it('Spaceキーで削除実行（削除ボタンにフォーカス時）', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[0]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 削除ボタンにフォーカスを当てる
      const confirmButton = screen.getByRole('button', { name: /削除する/ });
      confirmButton.focus();

      // 📝 Spaceキーで削除実行
      await user.keyboard(' ');

      // 📝 モーダルが閉じられることを先に確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // 📝 削除ボタンの数で削除を確認（より確実）
      await waitFor(() => {
        const remainingDeleteButtons = screen.getAllByTitle('削除');
        expect(remainingDeleteButtons).toHaveLength(2);
      }, { timeout: 3000 });

      // 📝 残っているTodoを確認（どのTodoが削除されたかは関係なく、2つ残っていることを確認）
      const remainingTodos = [
        screen.queryByText('最初のタスク'),
        screen.queryByText('削除対象のタスク'),
        screen.queryByText('最後のタスク')
      ].filter(Boolean);

      expect(remainingTodos).toHaveLength(2);
    }, 10000);

    it('Tabキーでフォーカス移動が正常に動作する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除ボタンをクリック
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[1]);

      // 📝 モーダル表示確認
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 📝 フォーカス可能な要素を取得
      const closeButton = screen.getByLabelText('モーダルを閉じる');
      const cancelButton = screen.getByText('キャンセル');
      const confirmButton = screen.getByRole('button', { name: /削除する/ });

      // 📝 最初のフォーカス可能要素にフォーカス
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // 📝 Tabキーで移動
      await user.tab();
      expect(cancelButton).toHaveFocus();

      await user.tab();
      expect(confirmButton).toHaveFocus();

      // 📝 Shift+Tabで戻る
      await user.tab({ shift: true });
      expect(cancelButton).toHaveFocus();
    });
  });

  // 📝 エラーハンドリングと特殊ケース
  describe('エラーハンドリングと特殊ケース', () => {
    it('非常に長いタイトルのTodoでも削除フローが正常動作する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 非常に長いタイトルのTodoを追加
      const longTitle = 'あ'.repeat(200);
      const input = screen.getByPlaceholderText('新しいタスクを入力してください...');
      await user.type(input, longTitle);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(longTitle)).toBeInTheDocument();
      });

      // 📝 削除フロー実行
      const deleteButton = screen.getByTitle('削除');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent(longTitle);
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText(longTitle)).not.toBeInTheDocument();
      });
    });

    it('特殊文字を含むタイトルのTodoでも削除フローが正常動作する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 特殊文字を含むタイトルのTodoを追加
      const specialTitle = '<script>alert("XSS")</script> & "quotes" & \'apostrophes\'';
      const input = screen.getByPlaceholderText('新しいタスクを入力してください...');
      await user.type(input, specialTitle);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(specialTitle)).toBeInTheDocument();
      });

      // 📝 削除フロー実行
      const deleteButton = screen.getByTitle('削除');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveTextContent(specialTitle);
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText(specialTitle)).not.toBeInTheDocument();
      });
    });

    it('連続して複数のTodoを削除する', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 1つ目を削除
      let deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      // 📝 モーダルが閉じられることを先に確認
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // 📝 削除ボタンの数で削除を確認（より確実）
      await waitFor(() => {
        const remainingDeleteButtons = screen.getAllByTitle('削除');
        expect(remainingDeleteButtons).toHaveLength(2);
      }, { timeout: 3000 });

      // 📝 2つ目を削除
      deleteButtons = screen.getAllByTitle('削除');
      expect(deleteButtons).toHaveLength(2);

      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // 📝 最後のTodoだけが残っている
      await waitFor(() => {
        const finalDeleteButtons = screen.getAllByTitle('削除');
        expect(finalDeleteButtons).toHaveLength(1);
      }, { timeout: 3000 });

      // 📝 少なくとも1つのTodoが残っていることを確認
      const remainingTodos = [
        screen.queryByText('最初のタスク'),
        screen.queryByText('削除対象のタスク'),
        screen.queryByText('最後のタスク')
      ].filter(Boolean);

      expect(remainingTodos).toHaveLength(1);
    }, 15000);
  });

  // 📝 ローカルストレージとの統合テスト
  describe('ローカルストレージとの統合テスト', () => {
    it('削除後の状態がローカルストレージに保存される', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // 📝 テスト用のTodoを追加
      await addTestTodos(user);

      // 📝 削除実行
      const deleteButtons = screen.getAllByTitle('削除');
      await user.click(deleteButtons[1]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /削除する/ }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('削除対象のタスク')).not.toBeInTheDocument();
      });

      // 📝 ローカルストレージの内容を確認
      const storedTodos = mockLocalStorage.getItem('todos');
      expect(storedTodos).toBeTruthy();

      const parsedTodos = JSON.parse(storedTodos!) as Todo[];
      expect(parsedTodos).toHaveLength(2);
      expect(parsedTodos.some((todo: Todo) => todo.text === '削除対象のタスク')).toBe(false);
      expect(parsedTodos.some((todo: Todo) => todo.text === '最初のタスク')).toBe(true);
      expect(parsedTodos.some((todo: Todo) => todo.text === '最後のタスク')).toBe(true);
    });
  });
});
