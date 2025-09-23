import { test, expect } from '@playwright/test';

test.describe('Todo App - Task Addition', () => {
  test.beforeEach(async ({ page }) => {
    // 📝 アプリケーションのホームページに移動
    await page.goto('/');
  });

  test('should be able to add a new task', async ({ page }) => {
    // 📝 初期状態のスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/01-initial-state.png', fullPage: true });

    // 📝 初期状態で「タスクがありません」メッセージが表示されることを確認
    await expect(page.getByText('タスクがありません。新しいタスクを追加してください。')).toBeVisible();

    // 📝 追加ボタンが初期状態では無効であることを確認
    const addButton = page.getByRole('button', { name: '追加' });
    await expect(addButton).toBeDisabled();

    // 📝 タスク入力フィールドにテストタスクを入力
    const taskInput = page.getByPlaceholder('新しいタスクを入力してください...');
    await taskInput.fill('テスト用のタスク');

    // 📝 入力後のスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/02-task-typed.png', fullPage: true });

    // 📝 追加ボタンが有効になることを確認
    await expect(addButton).toBeEnabled();

    // 📝 追加ボタンをクリック
    await addButton.click();

    // 📝 タスクが追加された後のスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/03-task-added.png', fullPage: true });

    // 📝 タスクがリストに表示されることを確認
    await expect(page.getByText('テスト用のタスク')).toBeVisible();

    // 📝 入力フィールドがクリアされることを確認
    await expect(taskInput).toHaveValue('');

    // 📝 アクティブタスクカウントが1になることを確認
    await expect(page.getByText('1個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();

    // 📝 アクティブフィルターに「1」のバッジが表示されることを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("1")')).toBeVisible();
  });

  test('should be able to add multiple tasks', async ({ page }) => {
    // 📝 最初のタスクを追加
    const taskInput = page.getByPlaceholder('新しいタスクを入力してください...');
    const addButton = page.getByRole('button', { name: '追加' });

    await taskInput.fill('1つ目のタスク');
    await addButton.click();

    // 📝 2つ目のタスクを追加
    await taskInput.fill('2つ目のタスク');
    await addButton.click();

    // 📝 複数タスク追加後のスクリーンショットを撮影
    await page.screenshot({ path: 'test-results/04-multiple-tasks.png', fullPage: true });

    // 📝 両方のタスクが表示されることを確認
    await expect(page.getByText('1つ目のタスク')).toBeVisible();
    await expect(page.getByText('2つ目のタスク')).toBeVisible();

    // 📝 アクティブタスクカウントが2になることを確認
    await expect(page.getByText('2個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();

    // 📝 アクティブフィルターに「2」のバッジが表示されることを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("2")')).toBeVisible();
  });

  test('should not add empty tasks', async ({ page }) => {
    const taskInput = page.getByPlaceholder('新しいタスクを入力してください...');
    const addButton = page.getByRole('button', { name: '追加' });

    // 📝 空文字列でのテスト
    await taskInput.fill('');
    await expect(addButton).toBeDisabled();

    // 📝 空白文字のみでのテスト
    await taskInput.fill('   ');
    await expect(addButton).toBeDisabled();

    // 📝 空のメッセージが表示されることを確認
    await expect(page.getByText('タスクがありません。新しいタスクを追加してください。')).toBeVisible();
  });

  test('should display task with correct metadata', async ({ page }) => {
    // 📝 タスクを追加
    const taskInput = page.getByPlaceholder('新しいタスクを入力してください...');
    const addButton = page.getByRole('button', { name: '追加' });

    await taskInput.fill('メタデータテスト用タスク');
    await addButton.click();

    // 📝 タスクが正しいメタデータで表示されることを確認
    const taskItem = page.locator('div:has-text("メタデータテスト用タスク")').first();
    
    // 📝 優先度が表示されることを確認
    await expect(page.getByText('MEDIUM')).toBeVisible();
    
    // 📝 ステータスが表示されることを確認
    await expect(page.getByText('未着手')).toBeVisible();
    
    // 📝 作成日時が表示されることを確認（年月日形式）
    await expect(page.locator('text=/2025年.*月.*日/')).toBeVisible();
    
    // 📝 チェックボックスが表示されることを確認
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    
    // 📝 編集・削除ボタンが表示されることを確認
    await expect(page.getByTitle('編集')).toBeVisible();
    await expect(page.getByTitle('削除')).toBeVisible();
  });
});