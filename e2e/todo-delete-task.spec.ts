import { test, expect } from '@playwright/test';

test.describe('Todo App - Task Deletion', () => {
  test.beforeEach(async ({ page }) => {
    // 📝 アプリケーションのホームページに移動
    await page.goto('/');
    
    // 📝 テスト用のタスクを事前に追加（削除テスト用のセットアップ）
    const taskInput = page.getByPlaceholder('新しいタスクを入力してください...');
    const addButton = page.getByRole('button', { name: '追加' });
    
    // 複数のタスクを追加してテストの前提条件を整える
    await taskInput.fill('削除テスト用タスク1');
    await addButton.click();
    
    await taskInput.fill('削除テスト用タスク2');
    await addButton.click();
    
    await taskInput.fill('削除テスト用タスク3');
    await addButton.click();
  });

  test('should be able to delete a single task', async ({ page }) => {
    // 📝 削除前の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/05-before-delete-single.png', fullPage: true });

    // 📝 初期状態で3つのタスクが存在することを確認
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).toBeVisible();
    
    // 📝 アクティブタスクが3個であることを確認
    await expect(page.getByText('3個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();

    // 📝 最初のタスクの削除ボタンをクリック
    const firstTaskContainer = page.locator('div:has-text("削除テスト用タスク1")').first();
    const deleteButton = firstTaskContainer.getByTitle('削除');
    await deleteButton.click();

    // 📝 削除後の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/06-after-delete-single.png', fullPage: true });

    // 📝 削除されたタスクが表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク1')).not.toBeVisible();
    
    // 📝 他のタスクは残っていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).toBeVisible();
    
    // 📝 アクティブタスクカウントが2に減っていることを確認
    await expect(page.getByText('2個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 アクティブフィルターのバッジが「2」に更新されていることを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("2")')).toBeVisible();
  });

  test('should be able to delete multiple tasks', async ({ page }) => {
    // 📝 削除前の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/07-before-delete-multiple.png', fullPage: true });

    // 📝 2つ目のタスクを削除
    let taskContainer = page.locator('div:has-text("削除テスト用タスク2")').first();
    let deleteButton = taskContainer.getByTitle('削除');
    await deleteButton.click();

    // 📝 1つ削除後のスクリーンショット
    await page.screenshot({ path: 'test-results/08-after-delete-second.png', fullPage: true });

    // 📝 3つ目のタスクを削除
    taskContainer = page.locator('div:has-text("削除テスト用タスク3")').first();
    deleteButton = taskContainer.getByTitle('削除');
    await deleteButton.click();

    // 📝 2つ削除後のスクリーンショット
    await page.screenshot({ path: 'test-results/09-after-delete-multiple.png', fullPage: true });

    // 📝 削除されたタスクが表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク2')).not.toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 最初のタスクだけが残っていることを確認
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    
    // 📝 アクティブタスクカウントが1に減っていることを確認
    await expect(page.getByText('1個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 アクティブフィルターのバッジが「1」に更新されていることを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("1")')).toBeVisible();
  });

  test('should display empty state after deleting all tasks', async ({ page }) => {
    // 📝 全削除前の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/10-before-delete-all.png', fullPage: true });

    // 📝 すべてのタスクを削除
    const deleteButtons = page.getByTitle('削除');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      // 📝 常に最初の削除ボタンをクリック（削除されると要素が減るため）
      await deleteButtons.first().click();
      // 📝 少し待機してDOMが更新されるのを確保
      await page.waitForTimeout(100);
    }

    // 📝 全削除後の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/11-after-delete-all.png', fullPage: true });

    // 📝 すべてのタスクが削除されたことを確認
    await expect(page.getByText('削除テスト用タスク1')).not.toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).not.toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 空の状態メッセージが表示されることを確認
    await expect(page.getByText('タスクがありません。新しいタスクを追加してください。')).toBeVisible();
    
    // 📝 カウンターがリセットされていることを確認
    await expect(page.getByText('0個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 フィルターバッジが表示されていないことを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("0")')).not.toBeVisible();
  });

  test('should delete completed tasks correctly', async ({ page }) => {
    // 📝 1つのタスクを完了状態にする
    const firstTaskCheckbox = page.locator('input[type="checkbox"]').first();
    await firstTaskCheckbox.click();
    
    // 📝 完了タスクがある状態でスクリーンショット
    await page.screenshot({ path: 'test-results/12-with-completed-task.png', fullPage: true });
    
    // 📝 完了済みタスクカウントが1になることを確認
    await expect(page.getByText('2個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 完了済みタスクを削除
    const completedTaskContainer = page.locator('div:has-text("削除テスト用タスク1")').first();
    const deleteButton = completedTaskContainer.getByTitle('削除');
    await deleteButton.click();
    
    // 📝 完了タスク削除後のスクリーンショット
    await page.screenshot({ path: 'test-results/13-completed-task-deleted.png', fullPage: true });
    
    // 📝 削除されたタスクが表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク1')).not.toBeVisible();
    
    // 📝 残りのタスクが表示されていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).toBeVisible();
    
    // 📝 カウンターが正しく更新されていることを確認
    await expect(page.getByText('2個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
  });

  test('should maintain filter state after deletion', async ({ page }) => {
    // 📝 2つのタスクを完了状態にする
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().click();
    await checkboxes.nth(1).click();
    
    // 📝 完了済みフィルターをクリック
    const completedFilter = page.getByRole('button', { name: /完了済み/ });
    await completedFilter.click();
    
    // 📝 フィルター適用後のスクリーンショット
    await page.screenshot({ path: 'test-results/14-completed-filter-applied.png', fullPage: true });
    
    // 📝 完了済みタスクのみが表示されていることを確認
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 完了済みタスクを1つ削除
    const firstCompletedTask = page.locator('div:has-text("削除テスト用タスク1")').first();
    const deleteButton = firstCompletedTask.getByTitle('削除');
    await deleteButton.click();
    
    // 📝 削除後もフィルターが維持されていることを確認
    await page.screenshot({ path: 'test-results/15-filter-maintained-after-delete.png', fullPage: true });
    
    // 📝 削除されたタスクが表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク1')).not.toBeVisible();
    
    // 📝 残りの完了済みタスクが表示されていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    
    // 📝 アクティブフィルターに切り替えて確認
    const activeFilter = page.getByRole('button', { name: /アクティブ/ });
    await activeFilter.click();
    
    // 📝 アクティブタスクのみが表示されることを確認
    await expect(page.getByText('削除テスト用タスク3')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).not.toBeVisible();
  });

  test('should show correct task count after bulk operations', async ({ page }) => {
    // 📝 初期状態のカウント確認
    await expect(page.getByText('3個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 2つのタスクを完了状態にする
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().click();
    await checkboxes.nth(1).click();
    
    // 📝 完了後のカウント確認
    await expect(page.getByText('1個のアクティブなタスク、2個の完了済みタスク')).toBeVisible();
    
    // 📝 完了済みタスクを1つ削除
    const completedTask = page.locator('div:has-text("削除テスト用タスク1")').first();
    await completedTask.getByTitle('削除').click();
    
    // 📝 削除後のカウント確認
    await expect(page.getByText('1個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 アクティブタスクを削除
    const activeTask = page.locator('div:has-text("削除テスト用タスク3")').first();
    await activeTask.getByTitle('削除').click();
    
    // 📝 最終的なカウント確認
    await expect(page.getByText('0個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 最後の操作結果をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/16-final-count-state.png', fullPage: true });
  });
});