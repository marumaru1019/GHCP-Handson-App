import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoFilter } from '@/components/list/TodoFilter';
import type { TodoFilter as TodoFilterType } from '@/types';

/**
 * テスト方針 (generate-test.prompt.md に準拠)
 * - 正常系: レンダリング / Props変化 / インタラクション / 状態変更
 * - 異常系: 型外値・極端値などでもクラッシュしないこと
 * ヘルパーを用いて重複を排除し、読みやすさと保守性を確保
 */

type ComponentProps = React.ComponentProps<typeof TodoFilter>;

const defaultProps = (): ComponentProps => ({
	currentFilter: 'all',
	onFilterChange: jest.fn(),
	activeTodosCount: 2,
	completedTodosCount: 3,
	onClearCompleted: jest.fn(),
});

const renderComponent = (override: Partial<ComponentProps> = {}) => {
	const props = { ...defaultProps(), ...override };
	const utils = render(<TodoFilter {...props} />);
	return { ...utils, props };
};

const getFilterButtons = () => {
	// 最初の 3 ボタンがフィルタ、4つ目以降は削除ボタンの可能性
	return screen.getAllByRole('button').slice(0, 3);
};

describe('TodoFilter', () => {
	describe('正常系: レンダリング', () => {
		it('基本フィルターボタン (すべて / アクティブ / 完了済み) が表示される', () => {
			renderComponent();
			const labels = getFilterButtons().map(b => b.textContent?.replace(/\s?\d+$/, '')?.trim());
			expect(labels).toEqual(['すべて', 'アクティブ', '完了済み']);
		});

		it('currentFilter に応じて選択中スタイルクラスが付与される (active -> completed)', () => {
			const { rerender, props } = renderComponent({ currentFilter: 'active' });
			const [allBtn, activeBtn] = getFilterButtons();
			expect(activeBtn.className).toMatch(/bg-white/); // active 選択

			rerender(<TodoFilter {...props} currentFilter="completed" />);
			const [, , completedBtnAfter] = getFilterButtons();
			expect(completedBtnAfter.className).toMatch(/bg-white/);
			expect(allBtn.className).not.toMatch(/bg-white/);
		});

		it('active / completed の件数バッジは正数値のみ表示される', () => {
			renderComponent({ activeTodosCount: 5, completedTodosCount: 7 });
			const [, activeBtn, completedBtn] = getFilterButtons();
			expect(within(activeBtn).getByText('5')).toBeInTheDocument();
			expect(within(completedBtn).getByText('7')).toBeInTheDocument();
		});

		it('件数が 0 以下 の場合バッジは表示されない (0 / -1)', () => {
			renderComponent({ activeTodosCount: 0, completedTodosCount: -1 });
			const [, activeBtn, completedBtn] = getFilterButtons();
			expect(within(activeBtn).queryByText('0')).not.toBeInTheDocument();
			expect(within(completedBtn).queryByText('-1')).not.toBeInTheDocument();
		});

		it('completedTodosCount > 0 のとき "完了済みを削除" ボタンが表示される', () => {
			renderComponent({ completedTodosCount: 1 });
			expect(screen.getByRole('button', { name: '完了済みを削除' })).toBeInTheDocument();
		});

		it('completedTodosCount = 0 のとき "完了済みを削除" ボタンは表示されない', () => {
			renderComponent({ completedTodosCount: 0 });
			expect(screen.queryByRole('button', { name: '完了済みを削除' })).not.toBeInTheDocument();
		});
	});

	describe('正常系: Props変化 / 再レンダリング', () => {
		it('activeTodosCount の更新でバッジ表示が動的に変化する', () => {
			const { rerender, props } = renderComponent({ activeTodosCount: 0 });
			const [, activeBtnInitial] = getFilterButtons();
			expect(within(activeBtnInitial).queryByText('0')).not.toBeInTheDocument();

			rerender(<TodoFilter {...props} activeTodosCount={4} />);
			const [, activeBtnAfter] = getFilterButtons();
			expect(within(activeBtnAfter).getByText('4')).toBeInTheDocument();
		});

		it('completedTodosCount の変化に伴い "完了済みを削除" ボタンの表示/非表示が切り替わる', () => {
			const { rerender, props } = renderComponent({ completedTodosCount: 0 });
			expect(screen.queryByRole('button', { name: '完了済みを削除' })).not.toBeInTheDocument();

			rerender(<TodoFilter {...props} completedTodosCount={5} />);
			expect(screen.getByRole('button', { name: '完了済みを削除' })).toBeInTheDocument();
		});
	});

	describe('正常系: インタラクション / 状態変更', () => {
		it('フィルターボタン押下で onFilterChange が適切な引数で呼ばれる', async () => {
			const user = userEvent.setup();
			const { props } = renderComponent();
			const spy = props.onFilterChange as jest.Mock;
			const [, activeBtn, completedBtn] = getFilterButtons();
			await user.click(activeBtn);
			expect(spy).toHaveBeenCalledWith('active');
			await user.click(completedBtn);
			expect(spy).toHaveBeenCalledWith('completed');
			expect(spy).toHaveBeenCalledTimes(2);
		});

		it('"完了済みを削除" ボタンクリックで onClearCompleted が呼ばれる', async () => {
			const user = userEvent.setup();
			const { props } = renderComponent({ completedTodosCount: 2 });
			const clearSpy = props.onClearCompleted as jest.Mock;
			await user.click(screen.getByRole('button', { name: '完了済みを削除' }));
			expect(clearSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('異常 / エッジケース', () => {
		it('不正な currentFilter (型外) を与えてもクラッシュしない', () => {
			// @ts-ignore 意図的に型外値を注入
			renderComponent({ currentFilter: 'unknown' as TodoFilterType });
			const [allBtn, activeBtn, completedBtn] = getFilterButtons();
			// 想定されるアクティブクラス (bg-white) がどれにも付与されない
			[allBtn, activeBtn, completedBtn].forEach(btn => {
				expect(btn.className).not.toMatch(/bg-white/);
			});
		});

		it('極端に大きい件数でもクラッシュせず両バッジが表示される', () => {
			const big = 999_999;
			renderComponent({ activeTodosCount: big, completedTodosCount: big });
			const occurrences = screen.getAllByText(String(big));
			expect(occurrences.length).toBe(2); // active / completed
		});

		it('負の値でもバッジ非表示で安全に動作する (active: -5)', () => {
			renderComponent({ activeTodosCount: -5, completedTodosCount: 10 });
			const [, activeBtn] = getFilterButtons();
			expect(within(activeBtn).queryByText('-5')).not.toBeInTheDocument();
		});
	});
});

