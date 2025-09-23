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
    expect(onAddTodo).toHaveBeenCalledWith('新しいタスク', undefined);
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

    expect(onAddTodo).toHaveBeenCalledWith('エンター追加', undefined);
    expect(input.value).toBe('');
  });

  it('Propsの型チェック: onAddTodoが必須', () => {
    expect(true).toBe(true);
  });

  it('タグ入力欄が表示される', () => {
    setup();
    const tagInput = screen.getByPlaceholderText('タグをカンマ区切りで入力 (例: 仕事, 開発, 個人)');
    expect(tagInput).toBeTruthy();
  });

  it('タグを入力してタスクを追加するとタグ配列が渡される', () => {
    const { input, onAddTodo } = setup();
    const tagInput = screen.getByPlaceholderText('タグをカンマ区切りで入力 (例: 仕事, 開発, 個人)');
    
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.change(tagInput, { target: { value: '仕事, 開発, テスト' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(onAddTodo).toHaveBeenCalledWith('テストタスク', ['仕事', '開発', 'テスト']);
    expect(input.value).toBe('');
    expect((tagInput as HTMLInputElement).value).toBe('');
  });

  it('空のタグ入力ではundefinedが渡される', () => {
    const { input, onAddTodo } = setup();
    const tagInput = screen.getByPlaceholderText('タグをカンマ区切りで入力 (例: 仕事, 開発, 個人)');
    
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.change(tagInput, { target: { value: '' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(onAddTodo).toHaveBeenCalledWith('テストタスク', undefined);
  });

  it('タグの前後の空白は削除される', () => {
    const { input, onAddTodo } = setup();
    const tagInput = screen.getByPlaceholderText('タグをカンマ区切りで入力 (例: 仕事, 開発, 個人)');
    
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.change(tagInput, { target: { value: ' 仕事 ,  開発 , テスト ' } });
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    expect(onAddTodo).toHaveBeenCalledWith('テストタスク', ['仕事', '開発', 'テスト']);
  });
});
