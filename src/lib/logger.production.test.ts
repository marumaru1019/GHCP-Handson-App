// 📝 本番環境でのロガー動作確認テスト

import { logger } from './logger';

// 🧪 本番環境をシミュレートするテスト
describe('Logger Production Mode', () => {
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

  describe('本番環境でのログ出力', () => {
    beforeEach(() => {
      // 🚀 本番環境をシミュレート
      process.env.NODE_ENV = 'production';
    });

    it('debug ログは出力されない（本番環境）', () => {
      logger.debug('デバッグメッセージ');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('info ログは本番環境でも出力される', () => {
      logger.info('情報メッセージ');
      expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ [INFO]', '情報メッセージ');
    });

    it('warn ログは本番環境でも出力される', () => {
      logger.warn('警告メッセージ');
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ [WARN]', '警告メッセージ');
    });

    it('error ログは本番環境でも出力される', () => {
      logger.error('エラーメッセージ');
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ [ERROR]', 'エラーメッセージ');
    });
  });

  describe('環境情報の確認', () => {
    it('本番環境での環境情報を正しく返す', () => {
      process.env.NODE_ENV = 'production';
      const envInfo = logger.getEnvironmentInfo();
      expect(envInfo.nodeEnv).toBe('production');
    });

    it('開発環境での環境情報を正しく返す', () => {
      process.env.NODE_ENV = 'development';
      const envInfo = logger.getEnvironmentInfo();
      expect(envInfo.nodeEnv).toBe('development');
    });
  });
});