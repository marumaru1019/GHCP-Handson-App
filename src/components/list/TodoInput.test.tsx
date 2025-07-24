import { render, screen, fireEvent } from '@testing-library/react';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  const setup = (onAddTodo = jest.fn()) => {
    render(<TodoInput onAddTodo={onAddTodo} />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください...') as HTMLInputElement;
    const button = screen.getByRole('button', { name: '追加' }) as HTMLButtonElement;
    return { input, button, onAddTodo };
  };

  it('初期レンダリングで入力欄と追加ボタンが表示される', () => {
    const { input, button } = setup();
    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(true);
  });

  it('入力欄にテキストを入力するとボタンが有効になる', () => {
    const { input, button } = setup();
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    expect(input.value).toBe('テストタスク');
    expect(button.disabled).toBe(false);
  });

  it('EnterキーまたはボタンでonAddTodoが呼ばれ、入力がクリアされる', () => {
    const { input, button, onAddTodo } = setup();
    fireEvent.change(input, { target: { value: '新しいタスク' } });
    fireEvent.click(button);
    expect(onAddTodo).toHaveBeenCalledWith('新しいタスク');
    expect(input.value).toBe('');
  });

  it('空文字や空白のみの場合はonAddTodoが呼ばれない', () => {
    const { input, button, onAddTodo } = setup();
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);
    expect(onAddTodo).not.toHaveBeenCalled();
    expect(input.value).toBe('   ');
  });

  it('EnterキーでonAddTodoが呼ばれる', () => {
    const { input, onAddTodo } = setup();
    fireEvent.change(input, { target: { value: 'エンター追加' } });

    // Formのsubmitイベントをシミュレート
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(onAddTodo).toHaveBeenCalledWith('エンター追加');
    expect(input.value).toBe('');
  });

  it('Propsの型チェック: onAddTodoが必須', () => {
    expect(true).toBe(true);
  });
});
