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

    // 📝 削除ボタンにホバーして削除対象を強調表示
    const deleteButton = page.getByRole('button', { name: '削除' }).first();
    await deleteButton.hover();
    await page.screenshot({ path: 'test-results/05-1-delete-button-hover.png', fullPage: true });

    // 📝 最初のタスクの削除ボタンをクリック（より具体的なセレクターを使用）
    // 📝 注意：タスクは新しい順に表示されるため、最初の削除ボタンは最新のタスク（タスク3）を削除する
    await deleteButton.click();

    // 📝 削除直後の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/06-after-delete-single.png', fullPage: true });

    // 📝 削除されたタスク（最新のタスク3）が表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 他のタスクは残っていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    
    // 📝 アクティブタスクカウントが2に減っていることを確認
    await expect(page.getByText('2個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 アクティブフィルターのバッジが「2」に更新されていることを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("2")')).toBeVisible();
  });

  test('should be able to delete multiple tasks', async ({ page }) => {
    // 📝 削除前の状態をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/07-before-delete-multiple.png', fullPage: true });

    // 📝 2つ目のタスクを削除（より具体的なセレクターを使用）
    // 📝 最初の削除で最新タスク（タスク3）が削除された後、次の削除でタスク2が削除される
    const firstDeleteButton = page.getByRole('button', { name: '削除' }).first();
    await firstDeleteButton.hover();
    await page.screenshot({ path: 'test-results/07-1-first-delete-hover.png', fullPage: true });
    await firstDeleteButton.click();

    // 📝 1つ削除後のスクリーンショット
    await page.screenshot({ path: 'test-results/08-after-delete-second.png', fullPage: true });

    // 📝 3つ目のタスクを削除（残りのタスクの最初の削除ボタンをクリック）
    // 📝 最後にタスク1が削除される
    const secondDeleteButton = page.getByRole('button', { name: '削除' }).first();
    await secondDeleteButton.hover();
    await page.screenshot({ path: 'test-results/08-1-second-delete-hover.png', fullPage: true });
    await secondDeleteButton.click();

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

    // 📝 すべてのタスクを削除（より効率的な方法を使用）
    const deleteButtons = page.getByRole('button', { name: '削除' });
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      // 📝 常に最初の削除ボタンをクリック（削除されると要素が減るため）
      await page.getByRole('button', { name: '削除' }).first().click();
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
    
    // 📝 カウンターが表示されていないことを確認（空の状態ではカウンターは非表示）
    await expect(page.getByText(/個のアクティブなタスク、.*個の完了済みタスク/)).not.toBeVisible();
    
    // 📝 フィルターバッジが表示されていないことを確認
    await expect(page.locator('button:has-text("アクティブ"):has-text("0")')).not.toBeVisible();
  });

  test('should delete completed tasks correctly', async ({ page }) => {
    // 📝 削除前の初期状態をスクリーンショット
    await page.screenshot({ path: 'test-results/12-0-initial-state.png', fullPage: true });

    // 📝 1つのタスクを完了状態にする（最新のタスク3を完了にする）
    const firstTaskCheckbox = page.locator('input[type="checkbox"]').first();
    await firstTaskCheckbox.click();
    
    // 📝 完了タスクがある状態でスクリーンショット
    await page.screenshot({ path: 'test-results/12-with-completed-task.png', fullPage: true });
    
    // 📝 完了済みタスクカウントが1になることを確認
    await expect(page.getByText('2個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 完了済みタスクの削除ボタンにホバー
    const deleteButton = page.getByRole('button', { name: '削除' }).first();
    await deleteButton.hover();
    await page.screenshot({ path: 'test-results/12-1-delete-completed-hover.png', fullPage: true });
    
    // 📝 完了済みタスクを削除（最初の削除ボタンをクリック）
    await deleteButton.click();
    
    // 📝 完了タスク削除後のスクリーンショット
    await page.screenshot({ path: 'test-results/13-completed-task-deleted.png', fullPage: true });
    
    // 📝 削除されたタスク（タスク3）が表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 残りのタスクが表示されていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    
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
    // 📝 タスク3とタスク2が完了済み、タスク1がアクティブ
    await expect(page.getByText('削除テスト用タスク3')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク1')).not.toBeVisible();
    
    // 📝 完了済みタスクを1つ削除（最初の削除ボタンをクリック）
    await page.getByRole('button', { name: '削除' }).first().click();
    
    // 📝 削除後もフィルターが維持されていることを確認
    await page.screenshot({ path: 'test-results/15-filter-maintained-after-delete.png', fullPage: true });
    
    // 📝 削除されたタスク（タスク3）が表示されていないことを確認
    await expect(page.getByText('削除テスト用タスク3')).not.toBeVisible();
    
    // 📝 残りの完了済みタスク（タスク2）が表示されていることを確認
    await expect(page.getByText('削除テスト用タスク2')).toBeVisible();
    
    // 📝 アクティブフィルターに切り替えて確認
    const activeFilter = page.getByRole('button', { name: /アクティブ/ });
    await activeFilter.click();
    
    // 📝 アクティブタスク（タスク1）のみが表示されることを確認
    await expect(page.getByText('削除テスト用タスク1')).toBeVisible();
    await expect(page.getByText('削除テスト用タスク2')).not.toBeVisible();
  });

  test('should show correct task count after bulk operations', async ({ page }) => {
    // 📝 初期状態のカウント確認
    await expect(page.getByText('3個のアクティブなタスク、0個の完了済みタスク')).toBeVisible();
    
    // 📝 2つのタスクを完了状態にする（最初の2つ：タスク3とタスク2）
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().click();
    await checkboxes.nth(1).click();
    
    // 📝 完了後のカウント確認
    await expect(page.getByText('1個のアクティブなタスク、2個の完了済みタスク')).toBeVisible();
    
    // 📝 完了済みタスクを1つ削除（最初の削除ボタンをクリック - タスク3を削除）
    await page.getByRole('button', { name: '削除' }).first().click();
    
    // 📝 削除後のカウント確認
    await expect(page.getByText('1個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 アクティブタスクを削除（残りの削除ボタンをクリック - タスク1を削除）
    await page.getByRole('button', { name: '削除' }).first().click();
    
    // 📝 最終的なカウント確認（タスク2のみが完了済みで残る）
    await expect(page.getByText('0個のアクティブなタスク、1個の完了済みタスク')).toBeVisible();
    
    // 📝 最後の操作結果をスクリーンショットで記録
    await page.screenshot({ path: 'test-results/16-final-count-state.png', fullPage: true });
  });
});