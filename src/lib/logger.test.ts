// 📝 ロガーユーティリティのテスト

import { logger } from './logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    // 📊 console メソッドをモック
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    // 🧹 モックをリセット
    jest.restoreAllMocks();
  });

  describe('開発環境でのログ出力', () => {
    beforeEach(() => {
      // 🔧 開発環境をシミュレート
      process.env.NODE_ENV = 'development';
      
      // ロガーインスタンスを再初期化するために、新しいインスタンスを作成
      // 注: 実際のテストでは、環境変数の変更をテストする場合、
      // モジュールの再読み込みが必要な場合があります
    });

    it('debug ログが出力される', () => {
      logger.debug('テストメッセージ');
      expect(consoleSpy.log).toHaveBeenCalledWith('🐞 [DEBUG]', 'テストメッセージ');
    });

    it('info ログが出力される', () => {
      logger.info('情報メッセージ');
      expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ [INFO]', '情報メッセージ');
    });

    it('warn ログが出力される', () => {
      logger.warn('警告メッセージ');
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ [WARN]', '警告メッセージ');
    });

    it('error ログが出力される', () => {
      logger.error('エラーメッセージ');
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ [ERROR]', 'エラーメッセージ');
    });
  });

  describe('複数引数でのログ出力', () => {
    it('複数の引数を正しく渡す', () => {
      const obj = { test: 'value' };
      logger.info('メッセージ', 123, obj);
      expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ [INFO]', 'メッセージ', 123, obj);
    });
  });

  describe('環境情報の取得', () => {
    it('環境情報を正しく返す', () => {
      const envInfo = logger.getEnvironmentInfo();
      expect(envInfo).toHaveProperty('isDevelopment');
      expect(envInfo).toHaveProperty('nodeEnv');
      expect(typeof envInfo.isDevelopment).toBe('boolean');
    });
  });
});