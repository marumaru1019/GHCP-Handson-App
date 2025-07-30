/**
 * 📅 日時ユーティリティのテスト
 */

import { getRelativeTime, getDetailedDateTime } from '../dateUtils';

describe('dateUtils', () => {
  describe('getRelativeTime', () => {
    beforeEach(() => {
      // 📅 固定の現在時刻を設定（2024年1月1日 12:00:00）
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('📍 30秒前の場合は「今」を返す', () => {
      const date = new Date('2024-01-01T11:59:30Z');
      expect(getRelativeTime(date)).toBe('今');
    });

    test('📍 5分前の場合は「5分前」を返す', () => {
      const date = new Date('2024-01-01T11:55:00Z');
      expect(getRelativeTime(date)).toBe('5分前');
    });

    test('📍 2時間前の場合は「2時間前」を返す', () => {
      const date = new Date('2024-01-01T10:00:00Z');
      expect(getRelativeTime(date)).toBe('2時間前');
    });

    test('📍 1日前の場合は「1日前」を返す', () => {
      const date = new Date('2023-12-31T12:00:00Z');
      expect(getRelativeTime(date)).toBe('1日前');
    });

    test('📍 1週間前の場合は「1週間前」を返す', () => {
      const date = new Date('2023-12-25T12:00:00Z');
      expect(getRelativeTime(date)).toBe('1週間前');
    });

    test('📍 1ヶ月前の場合は「1ヶ月前」を返す', () => {
      const date = new Date('2023-12-01T12:00:00Z');
      expect(getRelativeTime(date)).toBe('1ヶ月前');
    });

    test('📍 1年前の場合は「1年前」を返す', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(getRelativeTime(date)).toBe('1年前');
    });
  });

  describe('getDetailedDateTime', () => {
    test('📝 詳細な日時情報を日本語で返す', () => {
      const date = new Date('2024-01-01T12:30:45Z');
      const result = getDetailedDateTime(date);

      // 📊 日本語の形式が含まれているかを確認
      expect(result).toContain('2024年');
      expect(result).toContain('月');
      expect(result).toContain('日');
    });
  });
});
