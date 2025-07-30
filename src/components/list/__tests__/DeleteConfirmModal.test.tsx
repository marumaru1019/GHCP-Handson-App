import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    todoTitle: 'テスト用のTodoタイトル',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    // 📝 テスト後にbody要素のスタイルをリセット
    document.body.style.overflow = 'unset';
  });

  // 📝 正常系テスト
  describe('正常系テスト', () => {
    it('モーダルが開いているときに正常にレンダリングされる', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
      expect(screen.getByText('以下のTodoを削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('テスト用のTodoタイトル')).toBeInTheDocument();
      expect(screen.getByText('🚩 この操作は取り消せません。')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('削除する')).toBeInTheDocument();
    });

    it('isOpenがfalseのときモーダルが表示されない', () => {
      render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('todoTitleプロパティの内容が正しく表示される', () => {
      const customTitle = '長いタイトルのTodoアイテムテスト';
      render(<DeleteConfirmModal {...defaultProps} todoTitle={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('削除するボタンをクリックするとonConfirmが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      await user.click(screen.getByText('削除する'));

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('キャンセルボタンをクリックするとonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      await user.click(screen.getByText('キャンセル'));

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('閉じるボタン（X）をクリックするとonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('モーダルを閉じる');
      await user.click(closeButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('バックドロップをクリックするとonCancelが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('モーダル内部をクリックしてもonCancelが呼ばれない', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const modalContent = screen.getByText('削除の確認');
      await user.click(modalContent);

      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it('モーダル表示中にbody要素のoverflowがhiddenになる', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  // 📝 異常系テスト
  describe('異常系テスト', () => {
    it('onConfirmが未定義でもエラーが発生しない', () => {
      const props = { ...defaultProps, onConfirm: (() => {}) as () => void };

      expect(() => render(<DeleteConfirmModal {...props} />)).not.toThrow();
    });

    it('onCancelが未定義でもエラーが発生しない', () => {
      const props = { ...defaultProps, onCancel: (() => {}) as () => void };

      expect(() => render(<DeleteConfirmModal {...props} />)).not.toThrow();
    });

    it('todoTitleが空文字列でも正常にレンダリングされる', () => {
      render(<DeleteConfirmModal {...defaultProps} todoTitle="" />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('削除の確認')).toBeInTheDocument();
    });

    it('todoTitleが非常に長い文字列でも正常に表示される', () => {
      const longTitle = 'あ'.repeat(1000);
      render(<DeleteConfirmModal {...defaultProps} todoTitle={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('特殊文字を含むtodoTitleでも正常に表示される', () => {
      const specialTitle = '<script>alert("XSS")</script> & "quotes" & \'apostrophes\'';
      render(<DeleteConfirmModal {...defaultProps} todoTitle={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  // 📝 アクセシビリティテスト
  describe('アクセシビリティテスト', () => {
    it('適切なARIA属性が設定されている', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('モーダルタイトルに適切なIDが設定されている', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const title = screen.getByText('削除の確認');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('閉じるボタンに適切なaria-labelが設定されている', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('モーダルを閉じる');
      expect(closeButton).toBeInTheDocument();
    });

    it('Escapeキーでモーダルが閉じられる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('Escapeキーが複数回押されてもonCancelが適切に動作する', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      await user.keyboard('{Escape}');
      await user.keyboard('{Escape}');

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(2);
    });

    it('Tabキーでフォーカス移動が正常に動作する', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('モーダルを閉じる');
      const cancelButton = screen.getByText('キャンセル');
      const confirmButton = screen.getByText('削除する');

      // 📝 最初のフォーカス可能要素にフォーカス
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // 📝 Tabキーで次の要素に移動
      await user.tab();
      expect(cancelButton).toHaveFocus();

      await user.tab();
      expect(confirmButton).toHaveFocus();

      // 📝 Shift+Tabで前の要素に戻る
      await user.tab({ shift: true });
      expect(cancelButton).toHaveFocus();
    });

    it('Enterキーで削除ボタンがアクティベートされる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('削除する');
      confirmButton.focus();

      await user.keyboard('{Enter}');

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('Spaceキーで削除ボタンがアクティベートされる', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('削除する');
      confirmButton.focus();

      await user.keyboard(' ');

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  // 📝 状態変更の正常フロー
  describe('状態変更の正常フロー', () => {
    it('モーダルが閉じられた後にbody要素のスタイルがリセットされる', async () => {
      const { rerender } = render(<DeleteConfirmModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });
    });

    it('コンポーネントがアンマウントされた後にイベントリスナーが削除される', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<DeleteConfirmModal {...defaultProps} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('propsが更新されても適切に再レンダリングされる', () => {
      const { rerender } = render(<DeleteConfirmModal {...defaultProps} />);

      expect(screen.getByText('テスト用のTodoタイトル')).toBeInTheDocument();

      rerender(<DeleteConfirmModal {...defaultProps} todoTitle="更新されたタイトル" />);

      expect(screen.getByText('更新されたタイトル')).toBeInTheDocument();
      expect(screen.queryByText('テスト用のTodoタイトル')).not.toBeInTheDocument();
    });
  });
});
