import { render, screen, fireEvent } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { Todo, Priority, TodoStatus } from '@/types';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: 'test-1',
    text: 'テストタスク',
    completed: false,
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
    status: 'todo',
    priority: 'medium',
  };

  const defaultProps = {
    todo: mockTodo,
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onUpdatePriority: jest.fn(),
    onUpdateStatus: jest.fn(),
  };

  const setup = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    render(<TodoItem {...mergedProps} />);
    return mergedProps;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('TodoItemが正しく表示される', () => {
      setup();
      expect(screen.getByText('テストタスク')).toBeTruthy();
      expect(screen.getByRole('checkbox')).toBeTruthy();
      expect(screen.getByTitle('編集')).toBeTruthy();
      expect(screen.getByTitle('削除')).toBeTruthy();
    });

    it('Todo情報が正しく表示される', () => {
      setup();
      expect(screen.getByText('テストタスク')).toBeTruthy();
      expect(screen.getByText('MEDIUM')).toBeTruthy();
      expect(screen.getByText('未着手')).toBeTruthy();
      expect(screen.getByText('2024年1月1日 10:00')).toBeTruthy();
    });

    it('completedがtrueの場合、チェックボックスがチェック状態になる', () => {
      const completedTodo = { ...mockTodo, completed: true };
      setup({ todo: completedTodo });
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('completedがfalseの場合、チェックボックスがチェック状態でない', () => {
      setup();
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('チェックボックスのインタラクション', () => {
    it('チェックボックスをクリックするとonToggleが呼ばれる', () => {
      const props = setup();
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(props.onToggle).toHaveBeenCalledWith('test-1');
    });
  });

  describe('削除ボタンのインタラクション', () => {
    it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
      const props = setup();
      const deleteButton = screen.getByTitle('削除');
      fireEvent.click(deleteButton);
      expect(props.onDelete).toHaveBeenCalledWith('test-1');
    });
  });

  describe('編集機能', () => {
    it('編集ボタンをクリックすると編集モードに切り替わる', () => {
      setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('テストタスク');
    });

    it('テキストをクリックすると編集モードに切り替わる', () => {
      setup();
      const textDiv = screen.getByText('テストタスク');
      fireEvent.click(textDiv);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('テストタスク');
    });

    it('編集モードでテキストを変更してonBlurするとonEditが呼ばれる', () => {
      const props = setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '更新されたタスク' } });
      fireEvent.blur(textarea);
      
      expect(props.onEdit).toHaveBeenCalledWith('test-1', '更新されたタスク');
    });

    it('編集モードでEnterキーを押すとonEditが呼ばれる', () => {
      const props = setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Enterで更新' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      expect(props.onEdit).toHaveBeenCalledWith('test-1', 'Enterで更新');
    });

    it('編集モードでEscapeキーを押すと編集がキャンセルされる', () => {
      const props = setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'キャンセルされる変更' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      expect(props.onEdit).not.toHaveBeenCalled();
      expect(screen.getByText('テストタスク')).toBeTruthy();
    });

    it('空文字で編集を完了してもonEditが呼ばれない', () => {
      const props = setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.blur(textarea);
      
      expect(props.onEdit).not.toHaveBeenCalled();
    });

    it('同じテキストで編集を完了してもonEditが呼ばれない', () => {
      const props = setup();
      const editButton = screen.getByTitle('編集');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'テストタスク' } });
      fireEvent.blur(textarea);
      
      expect(props.onEdit).not.toHaveBeenCalled();
    });
  });

  describe('優先度バッジのインタラクション', () => {
    it('優先度バッジをクリックするとonUpdatePriorityが呼ばれる（medium → high）', () => {
      const props = setup();
      const priorityButton = screen.getByText('MEDIUM').closest('button');
      fireEvent.click(priorityButton!);
      expect(props.onUpdatePriority).toHaveBeenCalledWith('test-1', 'high');
    });

    it('優先度がhighの場合、クリックするとlowになる', () => {
      const highPriorityTodo = { ...mockTodo, priority: 'high' as Priority };
      const props = setup({ todo: highPriorityTodo });
      const priorityButton = screen.getByText('HIGH').closest('button');
      fireEvent.click(priorityButton!);
      expect(props.onUpdatePriority).toHaveBeenCalledWith('test-1', 'low');
    });

    it('優先度がlowの場合、クリックするとmediumになる', () => {
      const lowPriorityTodo = { ...mockTodo, priority: 'low' as Priority };
      const props = setup({ todo: lowPriorityTodo });
      const priorityButton = screen.getByText('LOW').closest('button');
      fireEvent.click(priorityButton!);
      expect(props.onUpdatePriority).toHaveBeenCalledWith('test-1', 'medium');
    });
  });

  describe('ステータスバッジのインタラクション', () => {
    it('ステータスバッジをクリックするとonUpdateStatusが呼ばれる（todo → in-progress）', () => {
      const props = setup();
      const statusButton = screen.getByText('未着手').closest('button');
      fireEvent.click(statusButton!);
      expect(props.onUpdateStatus).toHaveBeenCalledWith('test-1', 'in-progress');
    });

    it('ステータスがin-progressの場合、クリックするとdoneになる', () => {
      const inProgressTodo = { ...mockTodo, status: 'in-progress' as TodoStatus };
      const props = setup({ todo: inProgressTodo });
      const statusButton = screen.getByText('進行中').closest('button');
      fireEvent.click(statusButton!);
      expect(props.onUpdateStatus).toHaveBeenCalledWith('test-1', 'done');
    });

    it('ステータスがdoneの場合、クリックするとtodoになる', () => {
      const doneTodo = { ...mockTodo, status: 'done' as TodoStatus };
      const props = setup({ todo: doneTodo });
      const statusButton = screen.getByText('完了').closest('button');
      fireEvent.click(statusButton!);
      expect(props.onUpdateStatus).toHaveBeenCalledWith('test-1', 'todo');
    });
  });

  describe('表示スタイル', () => {
    it('completedがtrueの場合、opacity-75クラスが適用される', () => {
      const completedTodo = { ...mockTodo, completed: true };
      setup({ todo: completedTodo });
      // 最上位のコンテナ（flex flex-col gap-3 p-4 ...）に opacity-75 が付与される
      const container = screen.getByText('テストタスク').closest('div')?.parentElement;
      expect(container?.className).toMatch(/opacity-75/);
    });

    it('completedがtrueの場合、テキストにline-throughクラスが適用される', () => {
      const completedTodo = { ...mockTodo, completed: true };
      setup({ todo: completedTodo });
      const textDiv = screen.getByText('テストタスク');
      expect(textDiv.className).toMatch(/line-through/);
    });

    it('高優先度の場合、赤色のアイコンとスタイルが適用される', () => {
      const highPriorityTodo = { ...mockTodo, priority: 'high' as Priority };
      setup({ todo: highPriorityTodo });
      const priorityButton = screen.getByText('HIGH').closest('button');
      expect(priorityButton?.className).toMatch(/text-red-800|bg-red-100/);
    });

    it('低優先度の場合、緑色のスタイルが適用される', () => {
      const lowPriorityTodo = { ...mockTodo, priority: 'low' as Priority };
      setup({ todo: lowPriorityTodo });
      const priorityButton = screen.getByText('LOW').closest('button');
      expect(priorityButton?.className).toMatch(/text-green-800|bg-green-100/);
    });
  });

  describe('デフォルト値の処理', () => {
    it('priorityがundefinedの場合、mediumとして扱われる', () => {
      const todoWithoutPriority = { ...mockTodo, priority: undefined };
      setup({ todo: todoWithoutPriority });
      expect(screen.getByText('MEDIUM')).toBeTruthy();
    });

    it('statusがundefinedの場合、ステータスバッジは空になる', () => {
      const todoWithoutStatus = { ...mockTodo, status: undefined };
      setup({ todo: todoWithoutStatus });
      // ステータスバッジのボタンは存在するが、テキストが表示されない
      const statusButtons = screen.getAllByRole('button');
      const statusButton = statusButtons.find(button => 
        button.title === 'クリックでステータスを変更'
      );
      expect(statusButton).toBeTruthy();
      expect(statusButton?.textContent).toBe('');
    });
  });
});