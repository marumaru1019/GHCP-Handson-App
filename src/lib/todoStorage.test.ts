import { parseStoredTodos } from './todoStorage';

describe('parseStoredTodos', () => {
  const consoleSpy = {
    warn: jest.spyOn(console, 'warn').mockImplementation(),
  };

  beforeEach(() => {
    consoleSpy.warn.mockClear();
  });

  afterAll(() => {
    consoleSpy.warn.mockRestore();
  });

  describe('正常系', () => {
    it('有効な Todo 配列を正しくパースする', () => {
      const json = JSON.stringify([
        {
          id: 'test-1',
          text: 'テストタスク1',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
          status: 'todo',
          priority: 'high',
        },
        {
          id: 'test-2',
          text: 'テストタスク2',
          completed: true,
          createdAt: '2024-01-14T09:00:00.000Z',
          status: 'done',
          priority: 'low',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(2);
      expect(skippedCount).toBe(0);

      expect(todos[0].id).toBe('test-1');
      expect(todos[0].text).toBe('テストタスク1');
      expect(todos[0].completed).toBe(false);
      expect(todos[0].createdAt).toBeInstanceOf(Date);
      expect(todos[0].createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
      expect(todos[0].status).toBe('todo');
      expect(todos[0].priority).toBe('high');

      expect(todos[1].id).toBe('test-2');
      expect(todos[1].completed).toBe(true);
      expect(todos[1].status).toBe('done');
    });

    it('オプショナルフィールドが欠損している場合、デフォルト値を適用する', () => {
      const json = JSON.stringify([
        {
          id: 'test-1',
          text: 'タスク（status/priority なし、completed: false）',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 'test-2',
          text: 'タスク（status/priority なし、completed: true）',
          completed: true,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(2);
      expect(skippedCount).toBe(0);

      // completed: false の場合、status は 'todo'
      expect(todos[0].status).toBe('todo');
      expect(todos[0].priority).toBe('medium');

      // completed: true の場合、status は 'done'
      expect(todos[1].status).toBe('done');
      expect(todos[1].priority).toBe('medium');
    });

    it('空配列を正しく処理する', () => {
      const json = JSON.stringify([]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(0);
    });
  });

  describe('壊れた JSON', () => {
    it('無効な JSON 文字列の場合、空配列を返す', () => {
      const json = '{ invalid json }';

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(0);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('JSON パースに失敗'),
        expect.any(Error)
      );
    });

    it('配列ではないデータの場合、空配列を返す', () => {
      const json = JSON.stringify({ id: 'test', text: 'not an array' });

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(0);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('データが配列ではありません')
      );
    });

    it('null の場合、空配列を返す', () => {
      const json = 'null';

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(0);
    });
  });

  describe('不正日付', () => {
    it('不正な日付形式の場合、その要素をスキップする', () => {
      const json = JSON.stringify([
        {
          id: 'valid-1',
          text: '有効なタスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 'invalid-date',
          text: '不正な日付のタスク',
          completed: false,
          createdAt: 'invalid-date-string',
        },
        {
          id: 'valid-2',
          text: '別の有効なタスク',
          completed: true,
          createdAt: '2024-01-14T09:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(2);
      expect(skippedCount).toBe(1);
      expect(todos[0].id).toBe('valid-1');
      expect(todos[1].id).toBe('valid-2');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('1 件の不正なデータをスキップ')
      );
    });

    it('空文字の日付の場合、その要素をスキップする', () => {
      const json = JSON.stringify([
        {
          id: 'empty-date',
          text: '空の日付',
          completed: false,
          createdAt: '',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('日付フィールドが数値の場合でも有効ならパースする', () => {
      const timestamp = new Date('2024-01-15T10:00:00.000Z').getTime();
      const json = JSON.stringify([
        {
          id: 'numeric-date',
          text: 'タイムスタンプ日付',
          completed: false,
          createdAt: timestamp,
        },
      ]);

      // 数値は文字列ではないためスキップされる
      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });
  });

  describe('欠損フィールド', () => {
    it('id が欠損している場合、スキップする', () => {
      const json = JSON.stringify([
        {
          text: 'ID なしタスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('text が欠損している場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'no-text',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('completed が欠損している場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'no-completed',
          text: 'タスク',
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('createdAt が欠損している場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'no-createdAt',
          text: 'タスク',
          completed: false,
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('空の id 文字列の場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: '',
          text: '空IDタスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        {
          id: '   ',
          text: '空白IDタスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(2);
    });
  });

  describe('不正な型', () => {
    it('completed が文字列の場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'string-completed',
          text: 'タスク',
          completed: 'true',
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('不正な status の場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'invalid-status',
          text: 'タスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
          status: 'invalid-status',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('不正な priority の場合、スキップする', () => {
      const json = JSON.stringify([
        {
          id: 'invalid-priority',
          text: 'タスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
          priority: 'urgent',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(0);
      expect(skippedCount).toBe(1);
    });

    it('配列要素が null の場合、スキップする', () => {
      const json = JSON.stringify([
        null,
        {
          id: 'valid',
          text: 'タスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(1);
      expect(skippedCount).toBe(1);
    });

    it('配列要素がプリミティブ値の場合、スキップする', () => {
      const json = JSON.stringify([
        'string',
        123,
        true,
        {
          id: 'valid',
          text: 'タスク',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(1);
      expect(skippedCount).toBe(3);
    });
  });

  describe('複合ケース', () => {
    it('有効・無効が混在する場合、有効なものだけを復元する', () => {
      const json = JSON.stringify([
        // 有効
        {
          id: 'valid-1',
          text: '有効タスク1',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        // 無効: id なし
        {
          text: 'IDなし',
          completed: false,
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        // 有効
        {
          id: 'valid-2',
          text: '有効タスク2',
          completed: true,
          createdAt: '2024-01-14T10:00:00.000Z',
          status: 'done',
          priority: 'high',
        },
        // 無効: 不正日付
        {
          id: 'invalid-date',
          text: '不正日付',
          completed: false,
          createdAt: 'not-a-date',
        },
        // 無効: null
        null,
        // 有効
        {
          id: 'valid-3',
          text: '有効タスク3',
          completed: false,
          createdAt: '2024-01-13T10:00:00.000Z',
        },
      ]);

      const { todos, skippedCount } = parseStoredTodos(json);

      expect(todos).toHaveLength(3);
      expect(skippedCount).toBe(3);
      expect(todos[0].id).toBe('valid-1');
      expect(todos[1].id).toBe('valid-2');
      expect(todos[2].id).toBe('valid-3');
    });
  });
});
