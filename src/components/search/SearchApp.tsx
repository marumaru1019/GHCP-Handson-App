'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Todo, Priority, TodoStatus } from '@/types';
import { Search, Filter, Calendar, FileText, LayoutDashboard, ArrowUpDown } from 'lucide-react';
import { TodoItem } from '@/components/list/TodoItem';

const TODOS_STORAGE_KEY = 'todos';

type SortOrder = 'newest' | 'oldest' | 'priority' | 'alphabetical';

export function SearchApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // 📝 ローカルストレージからTodoデータを読み込み
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        // 📅 日付オブジェクトを復元
        const todosWithDates = parsedTodos.map((todo: Todo & { createdAt: string }) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          status: (todo.status || (todo.completed ? 'done' : 'todo')) as TodoStatus,
          priority: (todo.priority || 'medium') as Priority,
        }));
        setTodos(todosWithDates);
      }
    } catch (error) {
      console.error('❌ SearchApp: データ読み込み失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);  // 📝 検索・フィルタリング・ソート機能
  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos]; // � 配列のコピーを作成

    // 🔍 テキスト検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(todo =>
        todo.text.toLowerCase().includes(query)
      );
    }

    // 🎯 優先度フィルター
    if (selectedPriority !== 'all') {
      result = result.filter(todo => todo.priority === selectedPriority);
    }

    // 📊 ステータスフィルター
    if (selectedStatus !== 'all') {
      result = result.filter(todo => todo.status === selectedStatus);
    }

    // 📈 ソート処理
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return result;
  }, [todos, searchQuery, selectedPriority, selectedStatus, sortOrder]);

  // 📝 統計情報の計算
  const stats = useMemo(() => {
    const totalResults = filteredAndSortedTodos.length;
    const completedResults = filteredAndSortedTodos.filter(todo => todo.completed).length;
    const activeResults = totalResults - completedResults;

    const priorityCount = {
      high: filteredAndSortedTodos.filter(todo => todo.priority === 'high').length,
      medium: filteredAndSortedTodos.filter(todo => todo.priority === 'medium').length,
      low: filteredAndSortedTodos.filter(todo => todo.priority === 'low').length,
    };

    return {
      total: totalResults,
      completed: completedResults,
      active: activeResults,
      priority: priorityCount,
    };
  }, [filteredAndSortedTodos]);

  // 📝 ローカルストレージに保存する関数
  const saveToStorage = (updatedTodos: Todo[]) => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('❌ SearchApp: データ保存失敗:', error);
    }
  };

  // 📝 Todoアイテムの操作関数
  const handleToggleTodo = (id: string) => {
    setTodos(prev => {
      const updated = prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: (!todo.completed ? 'done' : 'todo') as TodoStatus
            }
          : todo
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => {
      const updated = prev.filter(todo => todo.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const handleEditTodo = (id: string, newText: string) => {
    setTodos(prev => {
      const updated = prev.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    setTodos(prev => {
      const updated = prev.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const handleUpdateStatus = (id: string, status: TodoStatus) => {
    setTodos(prev => {
      const updated = prev.map(todo =>
        todo.id === id
          ? {
              ...todo,
              status,
              completed: status === 'done'
            }
          : todo
      );
      saveToStorage(updated);
      return updated;
    });
  };

  // 📝 フィルター・ソートのリセット
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSortOrder('newest'); // 📝 ソート順もデフォルトにリセット
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0033] mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 📋 ヘッダーとナビゲーション */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Search className="text-[#ff0033]" size={32} />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Todo 検索
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                     font-medium transition-colors duration-200 flex items-center gap-2
                     focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
          >
            <FileText size={18} />
            リスト表示
          </Link>
          <Link
            href="/kanban"
            className="px-4 py-2 bg-[#ff0033] hover:bg-[#e6002e] text-white rounded-lg
                     font-medium transition-colors duration-200 flex items-center gap-2
                     focus:outline-none focus:ring-2 focus:ring-[#ff0033] focus:ring-offset-2"
          >
            <LayoutDashboard size={18} />
            カンバン表示
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* 🔍 検索バー */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Todoを検索..."
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600
                       rounded-lg focus:ring-2 focus:ring-[#ff0033] focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* 📊 フィルター・ソートコントロール */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">フィルター:</span>
            </div>

            {/* 🎯 優先度フィルター */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">すべての優先度</option>
              <option value="high">高優先度</option>
              <option value="medium">中優先度</option>
              <option value="low">低優先度</option>
            </select>

            {/* 📊 ステータスフィルター */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TodoStatus | 'all')}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">すべてのステータス</option>
              <option value="todo">未着手</option>
              <option value="in-progress">進行中</option>
              <option value="done">完了</option>
            </select>

            {/* 📈 ソート */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-gray-600 dark:text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="priority">優先度順</option>
                <option value="alphabetical">アルファベット順</option>
              </select>
            </div>

            {/* 🔄 リセットボタン */}
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400
                       hover:text-[#ff0033] dark:hover:text-[#ff0033] transition-colors"
            >
              リセット
            </button>
          </div>
        </div>

        {/* 📊 検索結果の統計 */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="search-stats">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-blue-800 dark:text-blue-200">
              📝 検索結果: <strong>{stats.total}件</strong>
            </span>
            <span className="text-green-700 dark:text-green-300">
              ✅ 完了: <strong>{stats.completed}件</strong>
            </span>
            <span className="text-orange-700 dark:text-orange-300">
              ⏳ 未完了: <strong>{stats.active}件</strong>
            </span>
            <span className="text-red-700 dark:text-red-300">
              🔥 高優先度: <strong>{stats.priority.high}件</strong>
            </span>
          </div>
        </div>

        {/* 📝 検索結果一覧 */}
        <div className="space-y-2">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-12">
              {todos.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Todoがありません</p>
                  <p className="text-sm">
                    <Link href="/" className="text-[#ff0033] hover:underline">
                      メインページ
                    </Link>
                    でTodoを作成してください
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">検索条件に一致するTodoがありません</p>
                  <p className="text-sm">検索条件を変更してお試しください</p>
                </div>
              )}
            </div>
          ) : (
            filteredAndSortedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onRequestDelete={(id, title) => {
                  // 📝 SearchAppでは確認なしで即座に削除
                  console.log(`削除対象: ${title}`); // 🐞 デバッグ用ログ
                  handleDeleteTodo(id);
                }}
                onEdit={handleEditTodo}
                onUpdatePriority={handleUpdatePriority}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
