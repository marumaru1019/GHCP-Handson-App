'use client';

import { useEffect } from 'react';
import { X, AlertTriangle, Check, XIcon } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  todoTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  todoTitle,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  // 📝 ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 📝 モーダル表示中はスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  // 📝 条件付きレンダリングでパフォーマンス最適化
  if (!isOpen) return null;

  // 📝 バックドロップクリックでモーダルを閉じる
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
        {/* 📝 ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              削除の確認
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* 📝 コンテンツ */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            以下のTodoを削除しますか？
          </p>
          <div className="bg-gray-50 p-3 rounded-md border-l-4 border-red-500 mb-6">
            <p className="font-medium text-gray-900 break-words">
              {todoTitle}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            🚩 この操作は取り消せません。
          </p>
        </div>

        {/* 📝 フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <XIcon size={16} className="inline mr-2" />
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Check size={16} className="inline mr-2" />
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
