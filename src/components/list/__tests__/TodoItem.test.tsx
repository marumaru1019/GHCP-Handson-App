import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '../TodoItem';
import { Todo, Priority, TodoStatus } from '@/types';

describe('TodoItem', () => {
  // 📝 モック関数の定義
  const defaultProps = {
    todo: {
      id: 'test-todo-1',
      text: 'テスト用のTodoアイテム',
      completed: false,
      createdAt: new Date('2024-01-01T10:00:00.000Z'),
      priority: 'medium' as Priority,
      status: 'todo' as TodoStatus
    } as Todo,
    onToggle: jest.fn(),
    onRequestDelete: jest.fn(),
    onEdit: jest.fn(),
    onUpdatePriority: jest.fn(),
    onUpdateStatus: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 📝 基本レンダリングテスト
  describe('基本レンダリング', () => {
    it('Todoアイテムが正常にレンダリングされる', () => {
      render(<TodoItem {...defaultProps} />);

      expect(screen.getByText('テスト用のTodoアイテム')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('未着手')).toBeInTheDocument();
    });

    it('完了済みのTodoアイテムが適切にスタイリングされる', () => {
      const completedTodo = { ...defaultProps.todo, completed: true };
      render(<TodoItem {...defaultProps} todo={completedTodo} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('優先度がhighの場合に適切なアイコンとスタイルが表示される', () => {
      const highPriorityTodo = { ...defaultProps.todo, priority: 'high' as Priority };
      render(<TodoItem {...defaultProps} todo={highPriorityTodo} />);

      expect(screen.getByText('HIGH')).toBeInTheDocument();
      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      expect(priorityButton).toHaveClass('text-red-800');
    });

    it('優先度がlowの場合に適切なアイコンとスタイルが表示される', () => {
      const lowPriorityTodo = { ...defaultProps.todo, priority: 'low' as Priority };
      render(<TodoItem {...defaultProps} todo={lowPriorityTodo} />);

      expect(screen.getByText('LOW')).toBeInTheDocument();
      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      expect(priorityButton).toHaveClass('text-green-800');
    });

    it('ステータスがin-progressの場合に適切に表示される', () => {
      const inProgressTodo = { ...defaultProps.todo, status: 'in-progress' as TodoStatus };
      render(<TodoItem {...defaultProps} todo={inProgressTodo} />);

      expect(screen.getByText('進行中')).toBeInTheDocument();
    });

    it('ステータスがdoneの場合に適切に表示される', () => {
      const doneTodo = { ...defaultProps.todo, status: 'done' as TodoStatus };
      render(<TodoItem {...defaultProps} todo={doneTodo} />);

      expect(screen.getByText('完了')).toBeInTheDocument();
    });
  });

  // 📝 インタラクションテスト
  describe('インタラクション', () => {
    it('チェックボックスをクリックするとonToggleが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(defaultProps.onToggle).toHaveBeenCalledWith('test-todo-1');
    });

    it('削除ボタンをクリックするとonRequestDeleteが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const deleteButton = screen.getByTitle('削除');
      await user.click(deleteButton);

      expect(defaultProps.onRequestDelete).toHaveBeenCalledWith('test-todo-1', 'テスト用のTodoアイテム');
    });

    it('編集ボタンをクリックすると編集モードになる', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      expect(screen.getByDisplayValue('テスト用のTodoアイテム')).toBeInTheDocument();
    });

    it('優先度ボタンをクリックすると優先度が循環変更される', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'high');
    });

    it('ステータスボタンをクリックするとステータスが循環変更される', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'in-progress');
    });
  });

  // 📝 編集機能テスト
  describe('編集機能', () => {
    it('テキストエリアで編集中にEnterキーを押すと編集が保存される', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      // 📝 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      const textarea = screen.getByDisplayValue('テスト用のTodoアイテム');
      await user.clear(textarea);
      await user.type(textarea, '編集されたテキスト');
      await user.keyboard('{Enter}');

      expect(defaultProps.onEdit).toHaveBeenCalledWith('test-todo-1', '編集されたテキスト');
    });

    it('テキストエリアで編集中にEscapeキーを押すと編集がキャンセルされる', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      // 📝 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      const textarea = screen.getByDisplayValue('テスト用のTodoアイテム');
      await user.clear(textarea);
      await user.type(textarea, '編集されたテキスト');
      await user.keyboard('{Escape}');

      expect(defaultProps.onEdit).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('テスト用のTodoアイテム')).toBeInTheDocument();
      });
    });

    it('テキストエリアからフォーカスが離れると編集が保存される', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      // 📝 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      const textarea = screen.getByDisplayValue('テスト用のTodoアイテム');
      await user.clear(textarea);
      await user.type(textarea, '編集されたテキスト');
      await user.tab(); // 📝 フォーカスを移動

      expect(defaultProps.onEdit).toHaveBeenCalledWith('test-todo-1', '編集されたテキスト');
    });

    it('空白のテキストで編集しようとしても保存されない', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      // 📝 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      const textarea = screen.getByDisplayValue('テスト用のTodoアイテム');
      await user.clear(textarea);
      await user.type(textarea, '   '); // 📝 空白のみ
      await user.keyboard('{Enter}');

      expect(defaultProps.onEdit).not.toHaveBeenCalled();
    });

    it('同じテキストで編集しても保存されない', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      // 📝 編集モードに切り替え
      const editButton = screen.getByTitle('編集');
      await user.click(editButton);

      // 📝 同じテキストでEnter（テキストエリアの参照を削除）
      await user.keyboard('{Enter}');

      expect(defaultProps.onEdit).not.toHaveBeenCalled();
    });

    it('テキストエリアをクリックして編集モードに入ることができる', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const textDiv = screen.getByText('テスト用のTodoアイテム');
      await user.click(textDiv);

      expect(screen.getByDisplayValue('テスト用のTodoアイテム')).toBeInTheDocument();
    });
  });

  // 📝 優先度変更テスト
  describe('優先度変更', () => {
    it('highからlowに循環変更される', async () => {
      const user = userEvent.setup();
      const highPriorityTodo = { ...defaultProps.todo, priority: 'high' as Priority };
      render(<TodoItem {...defaultProps} todo={highPriorityTodo} />);

      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'low');
    });

    it('lowからmediumに変更される', async () => {
      const user = userEvent.setup();
      const lowPriorityTodo = { ...defaultProps.todo, priority: 'low' as Priority };
      render(<TodoItem {...defaultProps} todo={lowPriorityTodo} />);

      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'medium');
    });

    it('undefinedの優先度がmediumとして扱われる', async () => {
      const user = userEvent.setup();
      const undefinedPriorityTodo = { ...defaultProps.todo, priority: undefined };
      render(<TodoItem {...defaultProps} todo={undefinedPriorityTodo} />);

      expect(screen.getByText('MEDIUM')).toBeInTheDocument();

      const priorityButton = screen.getByTitle('クリックで優先度を変更');
      await user.click(priorityButton);

      expect(defaultProps.onUpdatePriority).toHaveBeenCalledWith('test-todo-1', 'high');
    });
  });

  // 📝 ステータス変更テスト
  describe('ステータス変更', () => {
    it('todoからin-progressに変更される', async () => {
      const user = userEvent.setup();
      render(<TodoItem {...defaultProps} />);

      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'in-progress');
    });

    it('in-progressからdoneに変更される', async () => {
      const user = userEvent.setup();
      const inProgressTodo = { ...defaultProps.todo, status: 'in-progress' as TodoStatus };
      render(<TodoItem {...defaultProps} todo={inProgressTodo} />);

      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'done');
    });

    it('doneからtodoに循環変更される', async () => {
      const user = userEvent.setup();
      const doneTodo = { ...defaultProps.todo, status: 'done' as TodoStatus };
      render(<TodoItem {...defaultProps} todo={doneTodo} />);

      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'todo');
    });

    it('undefinedのステータスがtodoとして扱われる', async () => {
      const user = userEvent.setup();
      const undefinedStatusTodo = { ...defaultProps.todo, status: undefined };
      render(<TodoItem {...defaultProps} todo={undefinedStatusTodo} />);

      expect(screen.getByText('未着手')).toBeInTheDocument();

      const statusButton = screen.getByTitle('クリックでステータスを変更');
      await user.click(statusButton);

      expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith('test-todo-1', 'in-progress');
    });
  });

  // 📝 アクセシビリティテスト
  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定されている', () => {
      render(<TodoItem {...defaultProps} />);

      expect(screen.getByTitle('編集')).toBeInTheDocument();
      expect(screen.getByTitle('削除')).toBeInTheDocument();
      expect(screen.getByTitle('クリックで優先度を変更')).toBeInTheDocument();
      expect(screen.getByTitle('クリックでステータスを変更')).toBeInTheDocument();
    });

    it('日時のツールチップが表示される', () => {
      render(<TodoItem {...defaultProps} />);

      const dateElement = screen.getByTitle(/2024年1月1日/);
      expect(dateElement).toBeInTheDocument();
    });
  });

  // 📝 エッジケーステスト
  describe('エッジケース', () => {
    it('非常に長いテキストでも正常に表示される', () => {
      const longTextTodo = {
        ...defaultProps.todo,
        text: 'あ'.repeat(1000)
      };
      render(<TodoItem {...defaultProps} todo={longTextTodo} />);

      expect(screen.getByText('あ'.repeat(1000))).toBeInTheDocument();
    });

    it('特殊文字を含むテキストでも正常に表示される', () => {
      const specialTextTodo = {
        ...defaultProps.todo,
        text: '<script>alert("XSS")</script> & "quotes" & \'apostrophes\''
      };
      render(<TodoItem {...defaultProps} todo={specialTextTodo} />);

      expect(screen.getByText('<script>alert("XSS")</script> & "quotes" & \'apostrophes\'')).toBeInTheDocument();
    });

    it('古い日付でも正常に表示される', () => {
      const oldDateTodo = {
        ...defaultProps.todo,
        createdAt: new Date('2020-01-01T00:00:00.000Z')
      };
      render(<TodoItem {...defaultProps} todo={oldDateTodo} />);

      // 📝 相対時間が表示されることを確認
      expect(screen.getByText(/年前/)).toBeInTheDocument();
    });
  });
});
