// 📝 localStorage からの Todo データ復元ユーティリティ

import { Todo, SerializedTodo, TodoStatus, Priority } from '@/types';

/**
 * 有効な TodoStatus かどうかを検証
 */
function isValidTodoStatus(value: unknown): value is TodoStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done';
}

/**
 * 有効な Priority かどうかを検証
 */
function isValidPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high';
}

/**
 * 有効な Date 文字列かどうかを検証
 * ISO 8601 形式またはパース可能な日付文字列を受け入れる
 */
function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * 単一の SerializedTodo オブジェクトを検証
 * 必須フィールドが存在し、正しい型であることを確認
 */
function isValidSerializedTodo(value: unknown): value is SerializedTodo {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  // 必須フィールドの検証
  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;
  if (typeof obj.text !== 'string') return false;
  if (typeof obj.completed !== 'boolean') return false;
  if (!isValidDateString(obj.createdAt)) return false;

  // オプショナルフィールドの検証（存在する場合のみ）
  if (obj.status !== undefined && !isValidTodoStatus(obj.status)) return false;
  if (obj.priority !== undefined && !isValidPriority(obj.priority)) return false;

  return true;
}

/**
 * SerializedTodo を Todo に変換
 * 既存データとの互換性を維持しつつ、デフォルト値を適用
 */
function deserializeTodo(serialized: SerializedTodo): Todo {
  return {
    id: serialized.id,
    text: serialized.text,
    completed: serialized.completed,
    createdAt: new Date(serialized.createdAt),
    status: serialized.status || (serialized.completed ? 'done' : 'todo'),
    priority: serialized.priority || 'medium',
  };
}

export interface ParseResult {
  todos: Todo[];
  skippedCount: number;
}

/**
 * JSON 文字列から Todo 配列を復元
 * 不正なデータはスキップし、警告をログに出力
 *
 * @param json - localStorage から取得した JSON 文字列
 * @returns 復元された Todo 配列とスキップ件数
 */
export function parseStoredTodos(json: string): ParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    console.warn('⚠️ parseStoredTodos: JSON パースに失敗しました');
    return { todos: [], skippedCount: 0 };
  }

  if (!Array.isArray(parsed)) {
    console.warn('⚠️ parseStoredTodos: データが配列ではありません');
    return { todos: [], skippedCount: 0 };
  }

  const todos: Todo[] = [];
  let skippedCount = 0;

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];

    if (isValidSerializedTodo(item)) {
      todos.push(deserializeTodo(item));
    } else {
      skippedCount++;
      console.warn(`⚠️ parseStoredTodos: インデックス ${i} の要素をスキップしました`, item);
    }
  }

  if (skippedCount > 0) {
    console.warn(`⚠️ parseStoredTodos: ${skippedCount} 件の不正なデータをスキップしました`);
  }

  return { todos, skippedCount };
}
