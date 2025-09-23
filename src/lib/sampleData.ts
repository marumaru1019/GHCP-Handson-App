// 📝 開発・テスト用のサンプルデータ生成ユーティリティ

import { Todo } from '@/types';
import { logger } from '@/lib';

export const generateSampleTodos = (): Todo[] => {
  const sampleTodos: Todo[] = [
    {
      id: 'sample-1',
      text: 'プロジェクトの企画書を作成する',
      completed: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
      status: 'todo',
      priority: 'high',
    },
    {
      id: 'sample-2',
      text: 'APIの設計とドキュメント作成',
      completed: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12時間前
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: 'sample-3',
      text: 'UI/UXのモックアップを作成',
      completed: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6時間前
      status: 'in-progress',
      priority: 'medium',
    },
    {
      id: 'sample-4',
      text: 'データベースの設計を完了',
      completed: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2日前
      status: 'done',
      priority: 'medium',
    },
    {
      id: 'sample-5',
      text: '開発環境のセットアップ',
      completed: true,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3日前
      status: 'done',
      priority: 'low',
    },
    {
      id: 'sample-6',
      text: 'コードレビューの実施',
      completed: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
      status: 'todo',
      priority: 'medium',
    },
  ];

  return sampleTodos;
};

// 🧪 サンプルデータをローカルストレージに保存
export const loadSampleData = () => {
  try {
    const sampleData = generateSampleTodos();
    // 🚫 既存データの確認はしない、常に新しいサンプルデータを返す
    return sampleData;
  } catch (error) {
    logger.error('サンプルデータの生成に失敗しました:', error);
    return null;
  }
};
