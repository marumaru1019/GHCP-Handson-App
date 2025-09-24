import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

// localStorage のモック
const localStorageMock = (() => {
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
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// crypto.randomUUID のモック
let mockIdCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `test-uuid-${++mockIdCounter}`),
  },
});

// window.confirm のモック
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
});

describe('useTodos', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    mockIdCounter = 0; // Reset ID counter
    // Date をリセット
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('初期状態', () => {
    it('初期状態でTodoが空の配列であること', () => {
      const { result } = renderHook(() => useTodos());
      
      expect(result.current.todos).toEqual([]);
      expect(result.current.filter).toBe('all');
      expect(result.current.isInitialLoad).toBe(false);
      expect(result.current.activeTodosCount).toBe(0);
      expect(result.current.completedTodosCount).toBe(0);
    });

    it('ローカルストレージからデータを読み込むこと', () => {
      const mockTodos = [
        {
          id: 'test-1',
          text: 'テストTodo',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'todo',
          priority: 'medium',
        },
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockTodos));
      localStorageMock.getItem.mockReturnValueOnce('active');

      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('テストTodo');
      expect(result.current.filter).toBe('active');
    });
  });

  describe('Todo CRUD 操作', () => {
    it('addTodo: 新しいTodoを追加できること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('新しいタスク');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0]).toEqual({
        id: 'test-uuid-1',
        text: '新しいタスク',
        completed: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        status: 'todo',
        priority: 'medium',
      });
    });

    it('addTodo: 空白文字を自動でトリムすること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('  タスク  ');
      });

      expect(result.current.todos[0].text).toBe('タスク');
    });

    it('toggleTodo: Todoの完了状態を切り替えできること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('テストタスク');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(true);
      expect(result.current.todos[0].status).toBe('done');

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(false);
      expect(result.current.todos[0].status).toBe('todo');
    });

    it('deleteTodo: Todoを削除できること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('削除予定');
        result.current.addTodo('残すタスク');
      });

      // 削除予定は最後に追加されたため、配列の最後にある
      const deleteId = result.current.todos[1].id; // 配列の最後（削除予定）

      act(() => {
        result.current.deleteTodo(deleteId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('残すタスク');
    });

    it('editTodo: Todoのテキストを編集できること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('元のタスク');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(todoId, '編集されたタスク');
      });

      expect(result.current.todos[0].text).toBe('編集されたタスク');
    });

    it('editTodo: 編集時にテキストをトリムすること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('元のタスク');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(todoId, '  編集されたタスク  ');
      });

      expect(result.current.todos[0].text).toBe('編集されたタスク');
    });
  });

  describe('優先度とステータス更新', () => {
    it('updatePriority: 優先度を更新できること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('テストタスク');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.updatePriority(todoId, 'high');
      });

      expect(result.current.todos[0].priority).toBe('high');
    });

    it('updateStatus: ステータスを更新し、completedフラグも同期すること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('テストタスク');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.updateStatus(todoId, 'done');
      });

      expect(result.current.todos[0].status).toBe('done');
      expect(result.current.todos[0].completed).toBe(true);

      act(() => {
        result.current.updateStatus(todoId, 'in-progress');
      });

      expect(result.current.todos[0].status).toBe('in-progress');
      expect(result.current.todos[0].completed).toBe(false);
    });
  });

  describe('フィルタリングと計算値', () => {
    it('フィルターが正しく動作すること', () => {
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.addTodo('アクティブタスク1');
        result.current.addTodo('アクティブタスク2');
        result.current.addTodo('完了タスク');
      });

      // 最初に追加されたタスク（配列の最後）を完了にする
      const firstAddedTodoId = result.current.todos[2].id; // 配列の最後
      act(() => {
        result.current.toggleTodo(firstAddedTodoId);
      });

      // すべて表示
      act(() => {
        result.current.setFilter('all');
      });
      expect(result.current.filteredTodos).toHaveLength(3);

      // アクティブのみ表示
      act(() => {
        result.current.setFilter('active');
      });
      expect(result.current.filteredTodos).toHaveLength(2);

      // 完了済みのみ表示
      act(() => {
        result.current.setFilter('completed');
      });
      expect(result.current.filteredTodos).toHaveLength(1);
    });

    it('カウント値が正しく計算されること', () => {
      const { result } = renderHook(() => useTodos());
      
      act(() => {
        result.current.addTodo('アクティブタスク1');
        result.current.addTodo('アクティブタスク2');
        result.current.addTodo('完了タスク');
      });
      
      // 最初に追加されたタスク（配列の最後）を完了にする
      const firstAddedTodoId = result.current.todos[2].id; // 配列の最後
      act(() => {
        result.current.toggleTodo(firstAddedTodoId);
      });

      expect(result.current.activeTodosCount).toBe(2);
      expect(result.current.completedTodosCount).toBe(1);
    });
  });

  describe('データクリア操作', () => {
    it('clearCompleted: 完了済みTodoを削除できること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('アクティブ');
        result.current.addTodo('完了予定');
      });

      act(() => {
        result.current.toggleTodo(result.current.todos[0].id);
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('アクティブ');
    });

    it('clearAllData: 全データをクリアできること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('削除予定');
        result.current.setFilter('active');
      });

      act(() => {
        result.current.clearAllData();
      });

      expect(result.current.todos).toHaveLength(0);
      expect(result.current.filter).toBe('all');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('todos');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('todoFilter');
    });

    it('clearAllData: 確認ダイアログでキャンセルした場合は削除しないこと', () => {
      window.confirm = jest.fn(() => false);
      
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('保持されるタスク');
      });

      act(() => {
        result.current.clearAllData();
      });

      expect(result.current.todos).toHaveLength(1);
    });
  });

  describe('永続化', () => {
    it('Todoの変更時にローカルストレージに保存されること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('保存テスト');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'todos',
        expect.stringContaining('保存テスト')
      );
    });

    it('フィルターの変更時にローカルストレージに保存されること', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.setFilter('active');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('todoFilter', 'active');
    });
  });
});