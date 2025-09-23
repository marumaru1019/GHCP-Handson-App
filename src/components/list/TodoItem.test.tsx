import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { Todo } from '@/types';

describe('TodoItem', () => {
  // 📝 テスト用のサンプルTodoデータ
  const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 'test-todo-1',
    text: 'テストタスク',
    completed: false,
    createdAt: new Date('2024-01-01T12:00:00Z'),
    status: 'todo',
    priority: 'medium',
    ...overrides,
  });

  // 📝 モック関数の準備
  const mockProps = {
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onUpdatePriority: jest.fn(),
    onUpdateStatus: jest.fn(),
  };

  const setup = (todo: Todo = createMockTodo()) => {
    render(<TodoItem todo={todo} {...mockProps} />);
    return {
      todo,
      ...mockProps,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('📋 基本レンダリング', () => {
    it('初期レンダリングで必要な要素が表示される', () => {
      const todo = createMockTodo();
      setup(todo);

      // チェックボックス
      expect(screen.getByRole('checkbox')).toBeTruthy();
      
      // テキスト
      expect(screen.getByText('テストタスク')).toBeTruthy();
      
      // 優先度バッジ
      expect(screen.getByText('MEDIUM')).toBeTruthy();
      
      // ステータスバッジ
      expect(screen.getByText('未着手')).toBeTruthy();
      
      // アクションボタン
      expect(screen.getByTitle('編集')).toBeTruthy();
      expect(screen.getByTitle('削除')).toBeTruthy();
      
      // 作成日時
      expect(screen.getByText(/2024年1月1日/)).toBeTruthy();
    });

    it('完了状態のタスクが正しく表示される', () => {
      const completedTodo = createMockTodo({
        completed: true,
        status: 'done'
      });
      setup(completedTodo);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(screen.getByText('完了')).toBeTruthy();
    });

    it('異なる優先度が正しく表示される', () => {
      // High priority
      setup(createMockTodo({ priority: 'high' }));
      expect(screen.getByText('HIGH')).toBeTruthy();
      
      // Low priority
      setup(createMockTodo({ priority: 'low' }));
      expect(screen.getByText('LOW')).toBeTruthy();
    });

    it('異なるステータスが正しく表示される', () => {
      // In-progress status
      setup(createMockTodo({ status: 'in-progress' }));
      expect(screen.getByText('進行中')).toBeTruthy();
      
      // Done status
      setup(createMockTodo({ status: 'done' }));
      expect(screen.getByText('完了')).toBeTruthy();
    });
  });

  describe('🔘 チェックボックス機能', () => {
    it('チェックボックスをクリックするとonToggleが呼ばれる', () => {
      const { onToggle } = setup();
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onToggle).toHaveBeenCalledWith('test-todo-1');
    });

    it('完了状態のチェックボックスをクリックするとonToggleが呼ばれる', () => {
      const { onToggle } = setup(createMockTodo({ completed: true }));
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onToggle).toHaveBeenCalledWith('test-todo-1');
    });
  });

  describe('🗑️ 削除機能', () => {
    it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
      const { onDelete } = setup();
      
      const deleteButton = screen.getByTitle('削除');
      fireEvent.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledWith('test-todo-1');
    });
  });

  describe('📝 編集機能', () => {
    it('編集ボタンをクリックすると編集モードに切り替わる', () => {
      setup();
      
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      // テキストエリアが表示される
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('テストタスク');
      
      // 元のクリック可能なテキストdivが表示されない
      const textDivs = screen.queryAllByText('テストタスク').filter(
        element => element.tagName === 'DIV'
      );
      expect(textDivs).toHaveLength(0);
    });

    it('テキスト部分をクリックすると編集モードに切り替わる', () => {
      setup();
      
      const textDiv = screen.getByText('テストタスク');
      fireEvent.click(textDiv);
      
      expect(screen.getByRole('textbox')).toBeTruthy();
    });

    it('編集モードでテキストを変更できる', () => {
      setup();
      
      // 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '変更されたタスク' } });
      
      expect(textarea.value).toBe('変更されたタスク');
    });

    it('編集モードでEnterキーを押すとonEditが呼ばれる', () => {
      const { onEdit } = setup();
      
      // 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '変更されたタスク' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      expect(onEdit).toHaveBeenCalledWith('test-todo-1', '変更されたタスク');
    });

    it('編集モードでEscapeキーを押すと編集がキャンセルされる', () => {
      setup();
      
      // 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '変更されたタスク' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      // 編集モードが終了し、元のテキストが表示される
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(screen.getByText('テストタスク')).toBeTruthy();
    });

    it('編集モードでblurイベントが発生するとonEditが呼ばれる', () => {
      const { onEdit } = setup();
      
      // 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '変更されたタスク' } });
      fireEvent.blur(textarea);
      
      expect(onEdit).toHaveBeenCalledWith('test-todo-1', '変更されたタスク');
    });

    it('編集で空文字や同じテキストの場合はonEditが呼ばれない', () => {
      const { onEdit } = setup();
      
      // 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // 空文字の場合
      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.blur(textarea);
      expect(onEdit).not.toHaveBeenCalled();
      
      // 同じテキストの場合
      fireEvent.change(textarea, { target: { value: 'テストタスク' } });
      fireEvent.blur(textarea);
      expect(onEdit).not.toHaveBeenCalled();
      
      // 空白のみの場合
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.blur(textarea);
      expect(onEdit).not.toHaveBeenCalled();
    });
  });

  describe('🎯 優先度更新機能', () => {
    it('優先度バッジをクリックするとonUpdatePriorityが呼ばれる', () => {
      const { onUpdatePriority } = setup(createMockTodo({ priority: 'low' }));
      
      const priorityButton = screen.getByText('LOW');
      fireEvent.click(priorityButton);
      
      expect(onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'medium');
    });

    it('優先度が循環的に変更される', () => {
      const { onUpdatePriority } = setup(createMockTodo({ priority: 'medium' }));
      
      const priorityButton = screen.getByText('MEDIUM');
      fireEvent.click(priorityButton);
      
      expect(onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'high');
    });

    it('高優先度から低優先度に戻る', () => {
      const { onUpdatePriority } = setup(createMockTodo({ priority: 'high' }));
      
      const priorityButton = screen.getByText('HIGH');
      fireEvent.click(priorityButton);
      
      expect(onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'low');
    });
  });

  describe('📊 ステータス更新機能', () => {
    it('ステータスバッジをクリックするとonUpdateStatusが呼ばれる', () => {
      const { onUpdateStatus } = setup(createMockTodo({ status: 'todo' }));
      
      const statusButton = screen.getByText('未着手');
      fireEvent.click(statusButton);
      
      expect(onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'in-progress');
    });

    it('ステータスが循環的に変更される', () => {
      const { onUpdateStatus } = setup(createMockTodo({ status: 'in-progress' }));
      
      const statusButton = screen.getByText('進行中');
      fireEvent.click(statusButton);
      
      expect(onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'done');
    });

    it('完了ステータスから未着手に戻る', () => {
      const { onUpdateStatus } = setup(createMockTodo({ status: 'done' }));
      
      const statusButton = screen.getByText('完了');
      fireEvent.click(statusButton);
      
      expect(onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'todo');
    });
  });

  describe('📅 日時表示', () => {
    it('作成日時が正しく日本語形式で表示される', () => {
      const testDate = new Date('2024-03-15T14:30:00Z');
      setup(createMockTodo({ createdAt: testDate }));
      
      // 日本語ロケールでの表示を確認
      expect(screen.getByText(/2024年3月15日/)).toBeTruthy();
    });
  });

  describe('🎨 スタイル関連', () => {
    it('完了タスクは線消しスタイルが適用される', () => {
      setup(createMockTodo({ completed: true }));
      
      const textDiv = screen.getByText('テストタスク');
      expect(textDiv).toHaveClass('line-through');
    });

    it('未完了タスクは通常のスタイルが適用される', () => {
      setup(createMockTodo({ completed: false }));
      
      const textDiv = screen.getByText('テストタスク');
      expect(textDiv).not.toHaveClass('line-through');
    });
  });

  describe('🔧 Props型チェック', () => {
    it('必須Propsが正しく渡される', () => {
      const todo = createMockTodo();
      
      expect(() => {
        render(<TodoItem todo={todo} {...mockProps} />);
      }).not.toThrow();
    });
  });
});