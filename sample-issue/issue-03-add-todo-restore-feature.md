# Issue: 削除したTodoを復元する機能を追加する

## 概要
現在のTodoアプリでは、削除されたTodoアイテムを復元する機能がありません。ユーザー体験を向上させるために、削除されたTodoを復元できる機能を追加する必要があります。

## 目的
- ユーザーが誤って削除したTodoを復元できるようにする
- 削除操作に対する「取り消し」オプションを提供する
- ユーザー体験を改善する

## 作業内容

### 1. 状態管理の拡張
- 削除されたTodoを一時的に保存する状態を追加
- 復元機能を実装するためのアクションを追加

### 2. UI要素の追加
- 削除後に表示される「取り消し」通知を実装
- 最近削除されたTodoのリストを表示する機能（オプション）

### 3. 既存コンポーネントの修正
- `TodoApp.tsx`に削除取り消し機能を追加
- 必要に応じて`TodoFilter.tsx`や他のコンポーネントを更新

### 4. テストの追加
- 削除と復元機能のテストを追加

## 具体的な実装手順

1. まず、削除されたTodoを保存するための型と状態を追加します

   ```typescript
   // src/types/todo.ts に追加
   export interface DeletedTodo {
     id: string;
     text: string;
     completed: boolean;
     deletedAt: number;
   }
   ```

2. TodoApp.tsxコンポーネントを修正して削除されたTodoを保存し、復元機能を追加します

   ```typescript
   // src/components/TodoApp.tsx
   'use client';

   import { useState, useEffect } from 'react';
   import { TodoInput } from './TodoInput';
   import { TodoItem } from './TodoItem';
   import { TodoFilter } from './TodoFilter';
   import type { Todo, TodoFilter as TodoFilterType, DeletedTodo } from '@/types/todo';

   export const TodoApp = () => {
     const [todos, setTodos] = useState<Todo[]>([]);
     const [filter, setFilter] = useState<TodoFilterType>('all');
     const [deletedTodos, setDeletedTodos] = useState<DeletedTodo[]>([]);
     const [lastDeletedTodo, setLastDeletedTodo] = useState<DeletedTodo | null>(null);
     const [showUndoNotification, setShowUndoNotification] = useState(false);

     // ローカルストレージからTodoを読み込む既存の処理
     useEffect(() => {
       const storedTodos = localStorage.getItem('todos');
       if (storedTodos) {
         setTodos(JSON.parse(storedTodos));
       }
     }, []);

     // Todoが変更されたらローカルストレージに保存する既存の処理
     useEffect(() => {
       localStorage.setItem('todos', JSON.stringify(todos));
     }, [todos]);

     // 削除されたTodoをローカルストレージに保存する処理を追加
     useEffect(() => {
       localStorage.setItem('deletedTodos', JSON.stringify(deletedTodos));
     }, [deletedTodos]);

     // 初回ロード時に削除されたTodoをローカルストレージから読み込む
     useEffect(() => {
       const storedDeletedTodos = localStorage.getItem('deletedTodos');
       if (storedDeletedTodos) {
         setDeletedTodos(JSON.parse(storedDeletedTodos));
       }
     }, []);

     // 通知が表示されたら5秒後に非表示にする
     useEffect(() => {
       if (showUndoNotification) {
         const timer = setTimeout(() => {
           setShowUndoNotification(false);
           setLastDeletedTodo(null);
         }, 5000);
         return () => clearTimeout(timer);
       }
     }, [showUndoNotification]);

     const addTodo = (text: string) => {
       if (text.trim()) {
         const newTodo: Todo = {
           id: Date.now().toString(),
           text,
           completed: false,
         };
         setTodos([...todos, newTodo]);
       }
     };

     const toggleTodo = (id: string) => {
       setTodos(
         todos.map((todo) =>
           todo.id === id ? { ...todo, completed: !todo.completed } : todo
         )
       );
     };

     // 削除機能を修正して、削除されたTodoを保存するようにする
     const deleteTodo = (id: string) => {
       const todoToDelete = todos.find((todo) => todo.id === id);
       if (todoToDelete) {
         // 削除されたTodoを保存
         const deletedTodo: DeletedTodo = {
           ...todoToDelete,
           deletedAt: Date.now(),
         };
         setLastDeletedTodo(deletedTodo);
         setDeletedTodos([...deletedTodos, deletedTodo]);
         
         // 通知を表示
         setShowUndoNotification(true);
         
         // Todoリストから削除
         setTodos(todos.filter((todo) => todo.id !== id));
       }
     };

     // 削除の取り消し機能を追加
     const undoDelete = () => {
       if (lastDeletedTodo) {
         // 削除されたTodoをTodoリストに戻す
         const { id, text, completed } = lastDeletedTodo;
         const restoredTodo: Todo = { id, text, completed };
         setTodos([...todos, restoredTodo]);
         
         // 削除されたTodoリストから削除
         setDeletedTodos(deletedTodos.filter((todo) => todo.id !== id));
         
         // 通知を非表示にする
         setShowUndoNotification(false);
         setLastDeletedTodo(null);
       }
     };

     // 特定の削除済みTodoを復元する機能（オプション）
     const restoreDeletedTodo = (id: string) => {
       const todoToRestore = deletedTodos.find((todo) => todo.id === id);
       if (todoToRestore) {
         // 削除されたTodoをTodoリストに戻す
         const { id, text, completed } = todoToRestore;
         const restoredTodo: Todo = { id, text, completed };
         setTodos([...todos, restoredTodo]);
         
         // 削除されたTodoリストから削除
         setDeletedTodos(deletedTodos.filter((todo) => todo.id !== id));
       }
     };

     // 既存のフィルター処理
     const clearCompleted = () => {
       setTodos(todos.filter((todo) => !todo.completed));
     };

     const filteredTodos = todos.filter((todo) => {
       if (filter === 'active') return !todo.completed;
       if (filter === 'completed') return todo.completed;
       return true;
     });

     const activeTodosCount = todos.filter((todo) => !todo.completed).length;
     const completedTodosCount = todos.length - activeTodosCount;

     return (
       <div className="max-w-md mx-auto p-4">
         <h1 className="text-2xl font-bold text-center mb-6">Todoリスト</h1>
         <TodoInput onAddTodo={addTodo} />

         <ul className="mt-4 space-y-2">
           {filteredTodos.map((todo) => (
             <TodoItem
               key={todo.id}
               todo={todo}
               onToggle={toggleTodo}
               onDelete={deleteTodo}
             />
           ))}
         </ul>

         {todos.length > 0 && (
           <TodoFilter
             currentFilter={filter}
             onFilterChange={setFilter}
             activeTodosCount={activeTodosCount}
             completedTodosCount={completedTodosCount}
             onClearCompleted={clearCompleted}
           />
         )}
         
         {/* 削除取り消し通知 */}
         {showUndoNotification && (
           <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
             <span>Todoを削除しました</span>
             <button 
               onClick={undoDelete}
               className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm"
             >
               取り消す
             </button>
           </div>
         )}
         
         {/* オプション: 削除されたTodoの履歴を表示する機能 */}
         {deletedTodos.length > 0 && (
           <div className="mt-8">
             <h2 className="text-xl font-semibold mb-2">削除済みTodo</h2>
             <ul className="space-y-2">
               {deletedTodos.slice(0, 5).map((todo) => (
                 <li key={todo.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                   <span className="line-through text-gray-500">{todo.text}</span>
                   <button
                     onClick={() => restoreDeletedTodo(todo.id)}
                     className="text-blue-500 hover:text-blue-600"
                   >
                     復元
                   </button>
                 </li>
               ))}
             </ul>
           </div>
         )}
       </div>
     );
   };
   ```

3. TodoApp.tsxのテストを更新して、削除と復元機能をテストします

   ```typescript
   // src/components/TodoApp.test.tsx
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import { TodoApp } from './TodoApp';

   // LocalStorageのモック
   const localStorageMock = (() => {
     let store: Record<string, string> = {};
     return {
       getItem: (key: string) => store[key] || null,
       setItem: (key: string, value: string) => {
         store[key] = value;
       },
       clear: () => {
         store = {};
       },
     };
   })();

   Object.defineProperty(window, 'localStorage', { value: localStorageMock });

   describe('TodoApp', () => {
     beforeEach(() => {
       localStorageMock.clear();
       jest.useFakeTimers();
     });

     afterEach(() => {
       jest.useRealTimers();
     });

     it('Todoを削除した後に取り消しができる', async () => {
       render(<TodoApp />);
       
       // Todoを追加
       const input = screen.getByPlaceholderText('新しいタスクを入力...');
       fireEvent.change(input, { target: { value: 'テストタスク' } });
       fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
       
       // Todoが追加されたことを確認
       const todoItem = screen.getByText('テストタスク');
       expect(todoItem).toBeInTheDocument();
       
       // 削除ボタンをクリック
       const deleteButton = screen.getByLabelText('タスクを削除');
       fireEvent.click(deleteButton);
       
       // Todoが削除されたことを確認
       expect(screen.queryByText('テストタスク')).not.toBeInTheDocument();
       
       // 取り消し通知が表示されることを確認
       const undoButton = screen.getByText('取り消す');
       expect(undoButton).toBeInTheDocument();
       
       // 取り消しボタンをクリック
       fireEvent.click(undoButton);
       
       // Todoが復元されたことを確認
       expect(screen.getByText('テストタスク')).toBeInTheDocument();
     });

     it('取り消し通知は5秒後に自動的に消える', async () => {
       render(<TodoApp />);
       
       // Todoを追加
       const input = screen.getByPlaceholderText('新しいタスクを入力...');
       fireEvent.change(input, { target: { value: 'テストタスク' } });
       fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
       
       // Todoを削除
       const deleteButton = screen.getByLabelText('タスクを削除');
       fireEvent.click(deleteButton);
       
       // 取り消し通知が表示されることを確認
       let undoButton = screen.getByText('取り消す');
       expect(undoButton).toBeInTheDocument();
       
       // 5秒進める
       jest.advanceTimersByTime(5000);
       
       // 取り消し通知が消えていることを確認
       await waitFor(() => {
         expect(screen.queryByText('取り消す')).not.toBeInTheDocument();
       });
     });

     it('削除済みTodo一覧から復元できる', async () => {
       render(<TodoApp />);
       
       // Todoを2つ追加
       const input = screen.getByPlaceholderText('新しいタスクを入力...');
       fireEvent.change(input, { target: { value: 'タスク1' } });
       fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
       
       fireEvent.change(input, { target: { value: 'タスク2' } });
       fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
       
       // 両方のTodoが追加されたことを確認
       expect(screen.getByText('タスク1')).toBeInTheDocument();
       expect(screen.getByText('タスク2')).toBeInTheDocument();
       
       // 両方のTodoを削除
       const deleteButtons = screen.getAllByLabelText('タスクを削除');
       fireEvent.click(deleteButtons[0]);
       fireEvent.click(deleteButtons[1]);
       
       // 削除済みTodoセクションを確認
       expect(screen.getByText('削除済みTodo')).toBeInTheDocument();
       
       // 削除済みTodoリストから復元ボタンをクリック
       const restoreButtons = screen.getAllByText('復元');
       fireEvent.click(restoreButtons[0]); // 1つ目のTodoを復元
       
       // Todoが復元されたことを確認（厳密にはどのTodoが復元されたかは順序に依存する）
       expect(screen.getByText(/タスク[12]/)).toBeInTheDocument();
     });
   });
   ```

## 注意事項
- 削除されたTodoはローカルストレージに保存して永続化すること
- 復元通知は十分な時間表示され、視覚的に目立つこと
- 通知のスタイルはアプリ全体のデザインと調和すること
- 複数のTodoを連続で削除した場合も適切に処理すること
- 削除済みTodoは一定期間後に自動削除するか、または手動クリア機能を提供することも検討する

## 完了条件
- Todoを削除すると「取り消し」通知が表示される
- 「取り消し」ボタンをクリックすると、削除されたTodoが復元される
- 通知は一定時間後に自動的に消える
- 削除されたTodoの履歴が表示される（オプション機能）
- 削除されたTodoを履歴から復元できる（オプション機能）
- すべてのテストがパスする
